// PURE logic of the server AI quota (no network, no fs, no implicit clock:
// `now`/`rand` are injected). The IO (Netlify Blobs / memory) lives in lib/ai/quota.ts.
// No "server-only" here: this module is also imported by the scheduled purge function
// (netlify/functions/ai-quota-purge.ts), outside the Next bundler.
import { createHmac } from "node:crypto";
import { dayIn, resolveTimeZone, secondsUntilMidnightIn } from "../day";

export type QuotaFailMode = "closed" | "open";
export type QuotaDenyReason = "burst" | "daily" | "global";

export interface QuotaConfig {
    /** Useful calls / quota day / IP. Same source as the client (NEXT_PUBLIC_AI_DAILY_LIMIT). */
    dailyLimit: number;
    /** TOTAL calls / quota day, all IPs combined (the wallet). */
    globalCap: number;
    /** Burst: accepted reservations / minute / IP. */
    perMinute: number;
    /** Store missing or failing: "closed" = 503 (default), "open" = let calls through. */
    failMode: QuotaFailMode;
    /** IANA zone cutting the quota day (NEXT_PUBLIC_AI_QUOTA_TZ, shared with the client). UTC by default. */
    timeZone: string;
}

export const DEFAULT_GLOBAL_CAP = 1000;
export const DEFAULT_PER_MINUTE = 2;

// Integer >= 0; empty, non-integer or negative => fallback (a typo must not
// disable the protection by falling to NaN / 0).
export function parseNonNegativeInt(raw: string | undefined, fallback: number): number {
    if (raw === undefined || raw.trim() === "") return fallback;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 ? n : fallback;
}

export function readQuotaConfig(env: Record<string, string | undefined>, dailyLimit: number): QuotaConfig {
    return {
        dailyLimit,
        globalCap: parseNonNegativeInt(env.AI_GLOBAL_DAILY_CAP, DEFAULT_GLOBAL_CAP),
        perMinute: parseNonNegativeInt(env.AI_RATE_PER_MIN, DEFAULT_PER_MINUTE),
        failMode: env.AI_QUOTA_FAIL_MODE === "open" ? "open" : "closed",
        timeZone: resolveTimeZone(env.NEXT_PUBLIC_AI_QUOTA_TZ),
    };
}

/* ---------------------------- time & keys ---------------------------- */

/** Quota day "YYYY-MM-DD" in `tz` (UTC by default): identical to the client's todayISO() (lib/usage.ts). */
export function quotaDay(now: number, tz?: string): string {
    return dayIn(now, tz);
}
export function minuteIndex(now: number): number {
    return Math.floor(now / 60_000);
}
export function secondsUntilQuotaMidnight(now: number, tz?: string): number {
    return secondsUntilMidnightIn(now, tz);
}

// Keys prefixed by the DAY: Netlify Blobs has NO TTL, so the purge deletes the
// "directories" of past days (see staleDays). At most 1 key / active IP / day + 1 global.
export function ipKey(day: string, ipHash: string): string {
    return `${day}/ip/${ipHash}`;
}
export function globalKey(day: string): string {
    return `${day}/global`;
}

const DAY_DIR = /^\d{4}-\d{2}-\d{2}$/;
/** Day directories strictly before `today` (the others are ignored). */
export function staleDays(dirs: readonly string[], today: string): string[] {
    return dirs.map((d) => (d.endsWith("/") ? d.slice(0, -1) : d)).filter((d) => DAY_DIR.test(d) && d < today);
}

/* ------------------------------ IP ------------------------------ */

// Hex groups of one IPv6 half; an IPv4 embedded at the end (64:ff9b::192.0.2.1)
// counts as 2 groups.
function ipv6Groups(s: string): string[] {
    if (s === "") return [];
    return s.split(":").flatMap((part) => (part.includes(".") ? ["0", "0"] : [part]));
}

// Expands an IPv6 into 8 hex groups, or null if invalid.
function expandIpv6(ip: string): string[] | null {
    const halves = ip.split("::");
    if (halves.length > 2) return null;
    const compressed = halves.length === 2;
    const head = ipv6Groups(halves[0]);
    const tail = compressed ? ipv6Groups(halves[1]) : [];
    const missing = 8 - head.length - tail.length;
    if (compressed ? missing < 1 : missing !== 0) return null;
    const groups = [...head, ...Array<string>(missing).fill("0"), ...tail];
    return groups.every((g) => /^[0-9a-f]{1,4}$/.test(g)) ? groups : null;
}

/**
 * Quota identity of an IP. IPv4: the address. IPv6: the /64 prefix (a subscriber usually
 * gets a whole /64; without this, they could rotate addresses endlessly and bypass the quota).
 */
export function normalizeIp(raw: string): string {
    const ip = raw.trim().toLowerCase().split("%")[0];
    const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(ip);
    if (mapped) return mapped[1];
    if (!ip.includes(":")) return ip;
    const groups = expandIpv6(ip);
    if (!groups) return ip;
    return `${groups
        .slice(0, 4)
        .map((g) => parseInt(g, 16).toString(16))
        .join(":")}::/64`;
}

/** Truncated HMAC-SHA256 (server secret): not reversible without the secret, unlike FNV. */
export function hashIp(ip: string, secret: string): string {
    return createHmac("sha256", secret).update(normalizeIp(ip)).digest("base64url").slice(0, 22);
}

/* --------------------------- counters --------------------------- */

export interface IpState {
    /** Calls reserved today. */
    day: number;
    /** Minute (epoch index) of the current burst window. */
    win: number;
    /** Reservations within this minute. */
    burst: number;
}

const count = (v: unknown): number => (typeof v === "number" && Number.isInteger(v) && v > 0 ? v : 0);

/** Tolerant: a missing or corrupted value counts as zero (never throws on the data). */
export function parseIpState(raw: unknown): IpState {
    if (!raw || typeof raw !== "object") return { day: 0, win: 0, burst: 0 };
    const r = raw as Record<string, unknown>;
    return { day: count(r.day), win: count(r.win), burst: count(r.burst) };
}
export function parseCount(raw: unknown): number {
    if (!raw || typeof raw !== "object") return 0;
    return count((raw as Record<string, unknown>).n);
}

export type Decision<T> = { ok: true; next: T } | { ok: false; reason: QuotaDenyReason };

/** Burst AND daily quota of an IP, decided on ONE single record (a single CAS). */
export function decideIp(state: IpState, minute: number, cfg: QuotaConfig): Decision<IpState> {
    const burst = state.win === minute ? state.burst : 0;
    if (burst >= cfg.perMinute) return { ok: false, reason: "burst" };
    if (state.day >= cfg.dailyLimit) return { ok: false, reason: "daily" };
    return {
        ok: true,
        next: { day: state.day + 1, win: minute, burst: burst + 1 },
    };
}
export function decideGlobal(n: number, cfg: QuotaConfig): Decision<number> {
    if (n >= cfg.globalCap) return { ok: false, reason: "global" };
    return { ok: true, next: n + 1 };
}

// Refund (error / empty reply): only a USEFUL call counts, so both the
// daily credit AND the burst slot are given back. The burst remains an anti-flood brake: calls
// IN PROGRESS keep their slot, which bounds the parallelism of one IP.
export function refundIpState(state: IpState): IpState {
    return {
        ...state,
        day: Math.max(0, state.day - 1),
        burst: Math.max(0, state.burst - 1),
    };
}
export function refundCount(n: number): number {
    return Math.max(0, n - 1);
}

/** CAS retry delay: exponential + jitter, bounded (rand ∈ [0, 1)). */
export function casBackoffMs(attempt: number, rand: number): number {
    return Math.min(250, Math.round(10 * 2 ** attempt * (0.5 + rand)));
}

/** Retry-After (seconds): the minute for a burst, the next quota-day midnight otherwise. */
export function retryAfterFor(reason: QuotaDenyReason, now: number, tz?: string): number {
    return reason === "burst" ? 60 : secondsUntilQuotaMidnight(now, tz);
}
