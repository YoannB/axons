// Server quota engine: RESERVE before the LLM call, REFUND after a failure or an
// empty reply. Storage-agnostic: it only talks to an injected `CasStore` (compare-and-swap
// by ETag), with injected clock/randomness/sleep => testable without network or mocks.
// Adapters: Netlify Blobs (lib/ai/quota.ts) and memory (createMemoryStore, dev/tests).
import {
    casBackoffMs,
    decideGlobal,
    decideIp,
    globalKey,
    ipKey,
    minuteIndex,
    parseCount,
    parseIpState,
    refundCount,
    refundIpState,
    retryAfterFor,
    quotaDay,
    type Decision,
    type QuotaConfig,
    type QuotaDenyReason,
} from "./quota-pure";

export interface CasEntry {
    data: unknown;
    etag: string;
}
export interface CasStore {
    read(key: string): Promise<CasEntry | null>;
    /** `etag` null = create only if the key is missing. Returns false if the condition fails. */
    write(key: string, value: object, etag: string | null): Promise<boolean>;
}
export interface CasDeps {
    store: CasStore;
    maxAttempts: number;
    rand: () => number;
    sleep: (ms: number) => Promise<void>;
    log: (message: string, error: unknown) => void;
}

/** Too many concurrent writes on one key: treated as a store failure (fail mode). */
export class QuotaContentionError extends Error {
    constructor(key: string) {
        super(`quota: CAS abandonnée sur ${key}`);
        this.name = "QuotaContentionError";
    }
}

/** The store did not answer in time: treated as a store failure (fail mode). */
export class QuotaTimeoutError extends Error {
    constructor(ms: number) {
        super(`quota: store sans réponse après ${ms} ms`);
        this.name = "QuotaTimeoutError";
    }
}

// Race between `work` and a deadline. Needed because @netlify/blobs retries SILENTLY
// (5 × 5 s on 429/5xx/network errors): unbounded, the Netlify function is killed at ~30 s
// before the fail mode applies. `work` is not cancelled (Blobs exposes no
// abort), but the HTTP response goes out in time.
export function withDeadline<T>(work: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new QuotaTimeoutError(ms)), ms);
    });
    return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
}

// Reads the body ENTIRELY and returns a fresh Response, with no pending stream. Cancelling its
// body (what @netlify/blobs does on a 404) can no longer hang, even if `res` is a
// body.tee() branch (fetch patched by Next) whose cancellation never resolves.
// Bodiless statuses (204/205/304): a Response cannot carry one.
export async function bufferResponse(res: Response): Promise<Response> {
    const body = [204, 205, 304].includes(res.status) ? null : await res.arrayBuffer();
    return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

// `step` receives the current value (undefined if missing) and decides: write `next`,
// refuse (`ok: false`), or do nothing (`null`). Read + conditional write,
// replayed as long as a concurrent writer changed the key in between.
export async function casUpdate<R extends Decision<object> | null>(
    deps: CasDeps,
    key: string,
    step: (raw: unknown) => R,
): Promise<R> {
    for (let attempt = 0; attempt < deps.maxAttempts; attempt += 1) {
        const current = await deps.store.read(key);
        const decision = step(current?.data);
        if (!decision || !decision.ok) return decision;
        if (await deps.store.write(key, decision.next, current?.etag ?? null)) return decision;
        await deps.sleep(casBackoffMs(attempt, deps.rand()));
    }
    throw new QuotaContentionError(key);
}

export interface QuotaTicket {
    ipKey: string;
    globalKey: string;
}
export type ReserveOutcome =
    { ok: true; ticket: QuotaTicket } | { ok: false; reason: QuotaDenyReason; retryAfter: number };

const refundIpStep = (raw: unknown) =>
    raw === undefined ? null : { ok: true as const, next: refundIpState(parseIpState(raw)) };
const refundGlobalStep = (raw: unknown) =>
    raw === undefined ? null : { ok: true as const, next: { n: refundCount(parseCount(raw)) } };

// Refunds the IP credit without ever throwing (error path of a partial reservation).
async function refundIpQuietly(deps: CasDeps, key: string): Promise<void> {
    try {
        await casUpdate(deps, key, refundIpStep);
    } catch (error) {
        deps.log(`[ai:quota] remboursement IP perdu (${key})`, error);
    }
}

/**
 * Atomic reservation per key: (1) IP burst + daily quota on ONE record,
 * (2) global cap. If (2) refuses or fails, (1) is refunded. A store error is
 * propagated: the caller applies the fail mode.
 */
export async function reserve(deps: CasDeps, cfg: QuotaConfig, ipHash: string, now: number): Promise<ReserveOutcome> {
    const deny = (reason: QuotaDenyReason): ReserveOutcome => ({
        ok: false,
        reason,
        retryAfter: retryAfterFor(reason, now, cfg.timeZone),
    });
    // Feature disabled (limit 0 = buttons hidden client-side): nothing to read.
    if (cfg.dailyLimit <= 0) return deny("daily");

    const day = quotaDay(now, cfg.timeZone);
    const minute = minuteIndex(now);
    const ticket: QuotaTicket = {
        ipKey: ipKey(day, ipHash),
        globalKey: globalKey(day),
    };

    const ip = await casUpdate(deps, ticket.ipKey, (raw) => decideIp(parseIpState(raw), minute, cfg));
    if (!ip.ok) return deny(ip.reason);

    let global: Decision<object>;
    try {
        global = await casUpdate(deps, ticket.globalKey, (raw): Decision<object> => {
            const d = decideGlobal(parseCount(raw), cfg);
            return d.ok ? { ok: true, next: { n: d.next } } : d;
        });
    } catch (error) {
        await refundIpQuietly(deps, ticket.ipKey);
        throw error;
    }
    if (!global.ok) {
        await refundIpQuietly(deps, ticket.ipKey);
        return deny(global.reason);
    }
    return { ok: true, ticket };
}

/** Gives back the IP daily credit and the global credit (not the burst). May throw. */
export async function refund(deps: CasDeps, ticket: QuotaTicket): Promise<void> {
    await Promise.all([
        casUpdate(deps, ticket.ipKey, refundIpStep),
        casUpdate(deps, ticket.globalKey, refundGlobalStep),
    ]);
}

/**
 * In-memory store with the same CAS semantics as Blobs. DEV / TESTS ONLY: it is local
 * to one serverless instance, so worthless as a production quota.
 */
export function createMemoryStore(): CasStore {
    const map = new Map<string, { json: string; etag: string }>();
    let seq = 0;
    return {
        async read(key) {
            const entry = map.get(key);
            return entry ? { data: JSON.parse(entry.json), etag: entry.etag } : null;
        },
        async write(key, value, etag) {
            const current = map.get(key);
            const conflict = etag === null ? current !== undefined : current?.etag !== etag;
            if (conflict) return false;
            seq += 1;
            map.set(key, { json: JSON.stringify(value), etag: String(seq) });
            return true;
        },
    };
}
