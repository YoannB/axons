// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const MAX_BUCKETS = 10_000;

async function loadRateLimit() {
    vi.resetModules();
    return await import("@/lib/ai/rate-limit");
}

describe("hitRateLimit — fenêtre glissante par IP", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T00:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("retourne true pour une IP jamais vue (!b)", async () => {
        const { hitRateLimit } = await loadRateLimit();

        expect(hitRateLimit("203.0.113.10")).toBe(true);
    });

    it("retourne true tant que le compteur est inférieur au maximum (b.count < MAX_PER_WINDOW)", async () => {
        const { hitRateLimit } = await loadRateLimit();
        const ip = "203.0.113.11";

        for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
            expect(hitRateLimit(ip)).toBe(true);
        }
    });

    it("retourne false lorsque le maximum est atteint (b.count >= MAX_PER_WINDOW)", async () => {
        const { hitRateLimit } = await loadRateLimit();
        const ip = "203.0.113.12";

        for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
            hitRateLimit(ip);
        }

        expect(hitRateLimit(ip)).toBe(false);
    });

    it("ne réinitialise pas exactement à la borne now > resetAt (false)", async () => {
        const { hitRateLimit } = await loadRateLimit();
        const ip = "203.0.113.13";

        for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
            hitRateLimit(ip);
        }

        vi.advanceTimersByTime(WINDOW_MS);

        expect(hitRateLimit(ip)).toBe(false);
    });

    it("réinitialise le bucket dès que la fenêtre est dépassée (now > resetAt true)", async () => {
        const { hitRateLimit } = await loadRateLimit();
        const ip = "203.0.113.14";

        for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
            hitRateLimit(ip);
        }

        vi.advanceTimersByTime(WINDOW_MS + 1);

        expect(hitRateLimit(ip)).toBe(true);
    });

    it("maintient un bucket indépendant par IP", async () => {
        const { hitRateLimit } = await loadRateLimit();
        const firstIp = "203.0.113.15";
        const secondIp = "203.0.113.16";

        for (let i = 0; i < MAX_PER_WINDOW; i += 1) {
            hitRateLimit(firstIp);
        }

        expect(hitRateLimit(firstIp)).toBe(false);
        expect(hitRateLimit(secondIp)).toBe(true);
    });
});

describe("hitRateLimit — mémoire bornée (MAX_BUCKETS)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-10-20T00:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function exhaust(hit: (ip: string) => boolean, ip: string) {
        for (let i = 0; i < MAX_PER_WINDOW; i += 1) hit(ip);
        expect(hit(ip)).toBe(false);
    }

    it("Map pleine, buckets expirés : la purge libère la place sans évincer de bucket actif", async () => {
        const { hitRateLimit } = await loadRateLimit();

        exhaust(hitRateLimit, "blocked");
        vi.advanceTimersByTime(WINDOW_MS + 1);
        // Full Map: "blocked" (expired, now > resetAt) + MAX_BUCKETS - 1 fresh buckets.
        for (let i = 0; i < MAX_BUCKETS - 1; i += 1) hitRateLimit(`ip-${i}`);

        expect(hitRateLimit("newcomer")).toBe(true);
        // ip-0 (active) survived: its counter goes on, it is not reset.
        for (let i = 1; i < MAX_PER_WINDOW; i += 1) hitRateLimit("ip-0");
        expect(hitRateLimit("ip-0")).toBe(false);
    });

    it("Map pleine sans bucket expiré : évince le plus ancien (ip-0)", async () => {
        const { hitRateLimit } = await loadRateLimit();

        exhaust(hitRateLimit, "ip-oldest");
        for (let i = 1; i < MAX_BUCKETS; i += 1) hitRateLimit(`ip-${i}`);

        expect(hitRateLimit("newcomer")).toBe(true);
        // "ip-oldest" was evicted: it starts again from a fresh bucket.
        expect(hitRateLimit("ip-oldest")).toBe(true);
    });

    it("Map pleine : une IP déjà connue ne déclenche pas d'éviction", async () => {
        const { hitRateLimit } = await loadRateLimit();

        exhaust(hitRateLimit, "known");
        for (let i = 1; i < MAX_BUCKETS; i += 1) hitRateLimit(`ip-${i}`);

        expect(hitRateLimit("known")).toBe(false);
    });
});

describe("clientIpFrom — résolution de l'IP client", () => {
    async function ipOf(init: Record<string, string>) {
        const { clientIpFrom } = await loadRateLimit();
        return clientIpFrom(new Headers(init));
    }

    it("privilégie x-nf-client-connection-ip (posé par Netlify)", async () => {
        expect(
            await ipOf({
                "x-nf-client-connection-ip": " 198.51.100.7 ",
                "x-forwarded-for": "6.6.6.6",
            }),
        ).toBe("198.51.100.7");
    });

    it("ignore un x-nf-client-connection-ip vide et se replie sur x-forwarded-for", async () => {
        expect(
            await ipOf({
                "x-nf-client-connection-ip": "  ",
                "x-forwarded-for": " 203.0.113.1 , 10.0.0.1",
            }),
        ).toBe("203.0.113.1");
    });

    it("retourne 'local' sans en-tête exploitable", async () => {
        expect(await ipOf({})).toBe("local");
        expect(await ipOf({ "x-forwarded-for": " , 10.0.0.1" })).toBe("local");
    });
});
