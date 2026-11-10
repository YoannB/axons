// @vitest-environment node
import {
    QuotaContentionError,
    QuotaTimeoutError,
    bufferResponse,
    casUpdate,
    createMemoryStore,
    refund,
    reserve,
    withDeadline,
    type CasDeps,
    type CasStore,
} from "@/lib/ai/quota-core";
import type { QuotaConfig } from "@/lib/ai/quota-pure";
import { afterEach, describe, expect, it, vi } from "vitest";

const CFG: QuotaConfig = {
    dailyLimit: 3,
    globalCap: 10,
    perMinute: 2,
    failMode: "closed",
};
const NOON = Date.parse("2026-11-05T12:00:00.000Z");
const IP_KEY = "2026-11-05/ip/h1";
const G_KEY = "2026-11-05/global";

function makeDeps(store: CasStore = createMemoryStore()) {
    const sleeps: number[] = [];
    const logs: string[] = [];
    const deps: CasDeps = {
        store,
        maxAttempts: 3,
        rand: () => 0,
        sleep: async (ms) => {
            sleeps.push(ms);
        },
        log: (message) => {
            logs.push(message);
        },
    };
    return { deps, sleeps, logs };
}

// Inline fixture: the first `conflicts` writes fail (simulated concurrent writer).
function flakyStore(conflicts: number): CasStore & { writes: number } {
    const inner = createMemoryStore();
    const store = {
        writes: 0,
        read: (key: string) => inner.read(key),
        async write(key: string, value: object, etag: string | null) {
            store.writes += 1;
            if (store.writes <= conflicts) return false;
            return inner.write(key, value, etag);
        },
    };
    return store;
}

// Inline fixture: any operation on a key containing `match` throws (store failure).
function brokenOn(match: string, inner: CasStore = createMemoryStore()): CasStore {
    const fail = (key: string) => {
        if (key.includes(match)) throw new Error(`panne ${key}`);
    };
    return {
        async read(key) {
            fail(key);
            return inner.read(key);
        },
        async write(key, value, etag) {
            fail(key);
            return inner.write(key, value, etag);
        },
    };
}

const read = async (store: CasStore, key: string) => (await store.read(key))?.data;

describe("createMemoryStore — sémantique CAS", () => {
    it("clé absente → null", async () => {
        expect(await createMemoryStore().read("k")).toBeNull();
    });
    it("création conditionnelle (etag null), refusée si la clé existe", async () => {
        const s = createMemoryStore();
        expect(await s.write("k", { n: 1 }, null)).toBe(true);
        expect(await s.write("k", { n: 2 }, null)).toBe(false);
        expect(await read(s, "k")).toEqual({ n: 1 });
    });
    it("mise à jour seulement si l'ETag correspond", async () => {
        const s = createMemoryStore();
        await s.write("k", { n: 1 }, null);
        const entry = await s.read("k");
        expect(await s.write("k", { n: 2 }, "périmé")).toBe(false);
        expect(await s.write("k", { n: 2 }, entry!.etag)).toBe(true);
        expect(await s.write("k", { n: 3 }, entry!.etag)).toBe(false);
    });
    it("ETag fourni sur clé absente → refus", async () => {
        expect(await createMemoryStore().write("k", { n: 1 }, "1")).toBe(false);
    });
    it("renvoie une copie (aucune mutation partagée)", async () => {
        const s = createMemoryStore();
        await s.write("k", { n: 1 }, null);
        const entry = await s.read("k");
        (entry!.data as { n: number }).n = 99;
        expect(await read(s, "k")).toEqual({ n: 1 });
    });
});

describe("casUpdate", () => {
    it("écrit du premier coup", async () => {
        const { deps, sleeps } = makeDeps();
        expect(await casUpdate(deps, "k", () => ({ ok: true, next: { n: 1 } }))).toEqual({ ok: true, next: { n: 1 } });
        expect(sleeps).toEqual([]);
    });
    it("rejoue après un conflit, avec backoff", async () => {
        const store = flakyStore(2);
        const { deps, sleeps } = makeDeps(store);
        await casUpdate(deps, "k", () => ({ ok: true, next: { n: 1 } }));
        expect(store.writes).toBe(3);
        expect(sleeps).toEqual([5, 10]);
    });
    it("refus : aucune écriture", async () => {
        const store = flakyStore(0);
        const { deps } = makeDeps(store);
        expect(await casUpdate(deps, "k", () => ({ ok: false, reason: "daily" }))).toEqual({
            ok: false,
            reason: "daily",
        });
        expect(store.writes).toBe(0);
    });
    it("étape null : rien à faire", async () => {
        const store = flakyStore(0);
        const { deps } = makeDeps(store);
        expect(await casUpdate(deps, "k", () => null)).toBeNull();
        expect(store.writes).toBe(0);
    });
    it("contention persistante → QuotaContentionError", async () => {
        const { deps } = makeDeps(flakyStore(99));
        const err = await casUpdate(deps, "k", () => ({
            ok: true,
            next: {},
        })).catch((e: unknown) => e);
        expect(err).toBeInstanceOf(QuotaContentionError);
        expect((err as Error).name).toBe("QuotaContentionError");
    });
});

describe("reserve", () => {
    it("limite 0 (fonctionnalité masquée) : refus sans toucher au store", async () => {
        const { deps } = makeDeps(brokenOn("")); // would throw on the slightest access
        expect(await reserve(deps, { ...CFG, dailyLimit: 0 }, "h1", NOON)).toEqual({
            ok: false,
            reason: "daily",
            retryAfter: 43_200,
        });
    });
    it("accepte, incrémente IP et global, renvoie le ticket", async () => {
        const { deps } = makeDeps();
        expect(await reserve(deps, CFG, "h1", NOON)).toEqual({
            ok: true,
            ticket: { ipKey: IP_KEY, globalKey: G_KEY },
        });
        expect(await read(deps.store, IP_KEY)).toEqual({
            day: 1,
            win: Math.floor(NOON / 60_000),
            burst: 1,
        });
        expect(await read(deps.store, G_KEY)).toEqual({ n: 1 });
    });
    it("rafale : refus avec Retry-After 60, global intact", async () => {
        const { deps } = makeDeps();
        await reserve(deps, CFG, "h1", NOON);
        await reserve(deps, CFG, "h1", NOON);
        expect(await reserve(deps, CFG, "h1", NOON)).toEqual({
            ok: false,
            reason: "burst",
            retryAfter: 60,
        });
        expect(await read(deps.store, G_KEY)).toEqual({ n: 2 });
    });
    it("quota quotidien : refus jusqu'à minuit", async () => {
        const { deps } = makeDeps();
        for (let i = 0; i < 3; i += 1) await reserve(deps, CFG, "h1", NOON + i * 60_000);
        expect(await reserve(deps, CFG, "h1", NOON + 5 * 60_000)).toEqual({
            ok: false,
            reason: "daily",
            retryAfter: 43_200 - 300,
        });
    });
    it("plafond global : refus ET crédit IP rendu", async () => {
        const { deps } = makeDeps();
        const cfg = { ...CFG, globalCap: 1 };
        await reserve(deps, cfg, "h0", NOON);
        expect(await reserve(deps, cfg, "h1", NOON)).toMatchObject({
            ok: false,
            reason: "global",
        });
        expect(await read(deps.store, IP_KEY)).toMatchObject({ day: 0, burst: 0 });
    });
    it("panne sur le global : crédit IP rendu puis erreur propagée", async () => {
        const inner = createMemoryStore();
        const { deps } = makeDeps(brokenOn("/global", inner));
        await expect(reserve(deps, CFG, "h1", NOON)).rejects.toThrow("panne");
        expect(await read(inner, IP_KEY)).toMatchObject({ day: 0 });
    });
    it("panne sur le global ET remboursement impossible : journalisé, erreur propagée", async () => {
        const inner = createMemoryStore();
        let writes = 0;
        const store: CasStore = {
            read: (key) => (key.endsWith("/global") ? Promise.reject(new Error("panne")) : inner.read(key)),
            write: (key, value, etag) => {
                writes += 1;
                // 1st write = IP reservation; the following ones (refund) lose the CAS.
                return writes === 1 ? inner.write(key, value, etag) : Promise.resolve(false);
            },
        };
        const { deps, logs } = makeDeps(store);
        await expect(reserve(deps, CFG, "h1", NOON)).rejects.toThrow("panne");
        expect(logs).toEqual([`[ai:quota] remboursement IP perdu (${IP_KEY})`]);
    });
    it("concurrence : 20 réservations parallèles d'une IP n'en acceptent que 3", async () => {
        const { deps } = makeDeps();
        deps.maxAttempts = 50;
        const cfg = { ...CFG, perMinute: 100 };
        const results = await Promise.all(Array.from({ length: 20 }, () => reserve(deps, cfg, "h1", NOON)));
        expect(results.filter((r) => r.ok)).toHaveLength(3);
        expect(await read(deps.store, G_KEY)).toEqual({ n: 3 });
    });
});

describe("refund", () => {
    it("échecs remboursés : ni la rafale ni le jour ne bloquent les tentatives suivantes", async () => {
        const { deps } = makeDeps();
        for (let i = 0; i < 5; i += 1) {
            const r = await reserve(deps, CFG, "h1", NOON);
            if (!r.ok) throw new Error(`tentative ${i} refusée`);
            await refund(deps, r.ticket);
        }
        expect(await read(deps.store, IP_KEY)).toMatchObject({ day: 0, burst: 0 });
    });
    it("rend le crédit IP (jour + rafale) et global", async () => {
        const { deps } = makeDeps();
        const r = await reserve(deps, CFG, "h1", NOON);
        if (!r.ok) throw new Error("réservation attendue");
        await refund(deps, r.ticket);
        expect(await read(deps.store, IP_KEY)).toMatchObject({ day: 0, burst: 0 });
        expect(await read(deps.store, G_KEY)).toEqual({ n: 0 });
    });
    it("clés absentes (purgées) : aucune écriture", async () => {
        const store = flakyStore(0);
        const { deps } = makeDeps(store);
        await refund(deps, { ipKey: IP_KEY, globalKey: G_KEY });
        expect(store.writes).toBe(0);
    });
});

describe("withDeadline — borne le temps passé dans le store", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("rend le résultat du travail s'il finit avant le délai", async () => {
        await expect(withDeadline(Promise.resolve("ok"), 1_000)).resolves.toBe("ok");
    });

    it("propage l'erreur du travail s'il échoue avant le délai", async () => {
        await expect(withDeadline(Promise.reject(new Error("blobs down")), 1_000)).rejects.toThrow("blobs down");
    });

    it("rejette QuotaTimeoutError si le travail ne répond pas à temps (réessais Blobs silencieux)", async () => {
        vi.useFakeTimers();
        const pending = withDeadline(new Promise<never>(() => {}), 4_000);
        const assertion = expect(pending).rejects.toBeInstanceOf(QuotaTimeoutError);

        await vi.advanceTimersByTimeAsync(4_000);

        await assertion;
        await expect(pending).rejects.toThrow("quota: store sans réponse après 4000 ms");
    });

    it("annule le minuteur une fois le travail terminé (aucun rejet tardif)", async () => {
        vi.useFakeTimers();
        await withDeadline(Promise.resolve(1), 4_000);

        expect(vi.getTimerCount()).toBe(0);
    });
});

describe("bufferResponse — annulation sûre (bug fetch patché par Next + Blobs)", () => {
    it("reproduit le bug : annuler une branche de tee() ne se résout pas tant que l'autre reste ouverte", async () => {
        const [branch] = new Response("{}").body!.tee();
        const settled = await Promise.race([
            branch.cancel().then(() => "résolu"),
            new Promise((resolve) => setTimeout(() => resolve("pendu"), 50)),
        ]);

        expect(settled).toBe("pendu");
    });

    it("une branche de tee() bufferisée s'annule immédiatement", async () => {
        const [branch] = new Response('{"n":1}').body!.tee();

        const res = await bufferResponse(new Response(branch, { status: 404 }));

        await expect(res.body!.cancel()).resolves.toBeUndefined();
    });

    it("conserve statut, en-têtes et contenu", async () => {
        const [branch] = new Response('{"n":1}').body!.tee();
        const source = new Response(branch, { status: 404, statusText: "Not Found", headers: { etag: '"abc"' } });

        const res = await bufferResponse(source);

        expect(res.status).toBe(404);
        expect(res.statusText).toBe("Not Found");
        expect(res.headers.get("etag")).toBe('"abc"');
        expect(await res.json()).toEqual({ n: 1 });
    });

    it.each([204, 304])("statut %i : Response sans corps", async (status) => {
        const res = await bufferResponse(new Response(null, { status }));

        expect(res.status).toBe(status);
        expect(res.body).toBeNull();
    });
});
