// @vitest-environment node
import {
    DEFAULT_GLOBAL_CAP,
    DEFAULT_PER_MINUTE,
    casBackoffMs,
    decideGlobal,
    decideIp,
    globalKey,
    hashIp,
    ipKey,
    minuteIndex,
    normalizeIp,
    parseCount,
    parseIpState,
    parseNonNegativeInt,
    readQuotaConfig,
    refundCount,
    refundIpState,
    retryAfterFor,
    secondsUntilQuotaMidnight,
    staleDays,
    quotaDay,
    type QuotaConfig,
} from "@/lib/ai/quota-pure";
import { describe, expect, it } from "vitest";

const CFG: QuotaConfig = {
    dailyLimit: 3,
    globalCap: 10,
    perMinute: 2,
    failMode: "closed",
    timeZone: "UTC",
};
const NOON = Date.parse("2026-11-05T12:00:00.000Z");

describe("parseNonNegativeInt", () => {
    it("undefined → repli", () => {
        expect(parseNonNegativeInt(undefined, 7)).toBe(7);
    });
    it("chaîne vide/blanche → repli", () => {
        expect(parseNonNegativeInt("  ", 7)).toBe(7);
    });
    it("entier valide", () => {
        expect(parseNonNegativeInt("42", 7)).toBe(42);
    });
    it("zéro accepté", () => {
        expect(parseNonNegativeInt("0", 7)).toBe(0);
    });
    it("négatif → repli", () => {
        expect(parseNonNegativeInt("-1", 7)).toBe(7);
    });
    it("décimal → repli", () => {
        expect(parseNonNegativeInt("2.5", 7)).toBe(7);
    });
    it("non numérique → repli", () => {
        expect(parseNonNegativeInt("abc", 7)).toBe(7);
    });
});

describe("readQuotaConfig", () => {
    it("valeurs par défaut, fail-closed", () => {
        expect(readQuotaConfig({}, 3)).toEqual({
            dailyLimit: 3,
            globalCap: DEFAULT_GLOBAL_CAP,
            perMinute: DEFAULT_PER_MINUTE,
            failMode: "closed",
            timeZone: "UTC",
        });
    });
    it("lit les variables et le fail-open explicite", () => {
        expect(
            readQuotaConfig(
                {
                    AI_GLOBAL_DAILY_CAP: "500",
                    AI_RATE_PER_MIN: "5",
                    AI_QUOTA_FAIL_MODE: "open",
                    NEXT_PUBLIC_AI_QUOTA_TZ: "Europe/Paris",
                },
                1,
            ),
        ).toEqual({
            dailyLimit: 1,
            globalCap: 500,
            perMinute: 5,
            failMode: "open",
            timeZone: "Europe/Paris",
        });
    });
    it("toute autre valeur de fail mode reste closed", () => {
        expect(readQuotaConfig({ AI_QUOTA_FAIL_MODE: "OPEN" }, 3).failMode).toBe("closed");
    });
});

describe("temps et clés", () => {
    it("quotaDay = jour UTC par défaut", () => {
        expect(quotaDay(Date.parse("2026-11-05T23:59:59Z"))).toBe("2026-11-05");
    });
    it("quotaDay suit le fuseau configuré", () => {
        expect(quotaDay(Date.parse("2026-11-05T23:30:00Z"), "Europe/Paris")).toBe("2026-11-06");
    });
    it("minuteIndex", () => {
        expect(minuteIndex(120_001)).toBe(2);
    });
    it("secondes jusqu'à minuit UTC", () => {
        expect(secondsUntilQuotaMidnight(NOON)).toBe(43_200);
    });
    it("à minuit pile : un jour entier", () => {
        expect(secondsUntilQuotaMidnight(Date.parse("2026-11-05T00:00:00Z"))).toBe(86_400);
    });
    it("dernière milliseconde : au moins 1 s", () => {
        expect(secondsUntilQuotaMidnight(Date.parse("2026-11-05T23:59:59.999Z"))).toBe(1);
    });
    it("clés préfixées par le jour", () => {
        expect(ipKey("2026-11-05", "abc")).toBe("2026-11-05/ip/abc");
        expect(globalKey("2026-11-05")).toBe("2026-11-05/global");
    });
});

describe("staleDays", () => {
    it("garde les jours passés, ignore aujourd'hui, le futur et les noms étrangers", () => {
        expect(
            staleDays(["2026-11-03", "2026-11-04/", "2026-11-05", "2026-11-06", "misc", "2026-1-1"], "2026-11-05"),
        ).toEqual(["2026-11-03", "2026-11-04"]);
    });
});

describe("normalizeIp", () => {
    it("IPv4 inchangée (trim)", () => {
        expect(normalizeIp(" 203.0.113.7 ")).toBe("203.0.113.7");
    });
    it("IPv4 mappée en IPv6 → IPv4", () => {
        expect(normalizeIp("::FFFF:203.0.113.7")).toBe("203.0.113.7");
    });
    it("IPv6 complète → préfixe /64", () => {
        expect(normalizeIp("2001:0db8:0000:0042:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:0:42::/64");
    });
    it("IPv6 compressée, zone retirée", () => {
        expect(normalizeIp("2001:DB8::1%eth0")).toBe("2001:db8:0:0::/64");
    });
    it("IPv6 commençant par ::", () => {
        expect(normalizeIp("::1")).toBe("0:0:0:0::/64");
    });
    it("IPv6 avec IPv4 embarquée", () => {
        expect(normalizeIp("64:ff9b:1:2::192.0.2.1")).toBe("64:ff9b:1:2::/64");
    });
    it("deux '::' → invalide, renvoyée telle quelle", () => {
        expect(normalizeIp("1::2::3")).toBe("1::2::3");
    });
    it("'::' sans groupe manquant → invalide", () => {
        expect(normalizeIp("1:2:3:4:5:6:7:8::")).toBe("1:2:3:4:5:6:7:8::");
    });
    it("trop peu de groupes sans '::' → invalide", () => {
        expect(normalizeIp("1:2:3")).toBe("1:2:3");
    });
    it("groupe non hexadécimal → invalide", () => {
        expect(normalizeIp("gggg::1")).toBe("gggg::1");
    });
    it("valeur non IP (dev) inchangée", () => {
        expect(normalizeIp("local")).toBe("local");
    });
});

describe("hashIp", () => {
    const SECRET = "s".repeat(32);
    it("déterministe, 22 caractères base64url, sans l'IP en clair", () => {
        const h = hashIp("203.0.113.7", SECRET);
        expect(h).toBe(hashIp("203.0.113.7", SECRET));
        expect(h).toMatch(/^[A-Za-z0-9_-]{22}$/);
        expect(h).not.toContain("203");
    });
    it("dépend du secret", () => {
        expect(hashIp("203.0.113.7", "a".repeat(32))).not.toBe(hashIp("203.0.113.7", "b".repeat(32)));
    });
    it("deux adresses du même /64 partagent l'identité", () => {
        expect(hashIp("2001:db8::1", SECRET)).toBe(hashIp("2001:db8::ffff:2", SECRET));
    });
});

describe("parseIpState / parseCount", () => {
    it("absent → zéro", () => {
        expect(parseIpState(undefined)).toEqual({ day: 0, win: 0, burst: 0 });
    });
    it("non objet → zéro", () => {
        expect(parseIpState("x")).toEqual({ day: 0, win: 0, burst: 0 });
    });
    it("valide", () => {
        expect(parseIpState({ day: 2, win: 9, burst: 1 })).toEqual({
            day: 2,
            win: 9,
            burst: 1,
        });
    });
    it("champs corrompus → zéro", () => {
        expect(parseIpState({ day: -3, win: "9", burst: 1.5 })).toEqual({
            day: 0,
            win: 0,
            burst: 0,
        });
    });
    it("compteur absent → 0", () => {
        expect(parseCount(null)).toBe(0);
    });
    it("compteur non objet → 0", () => {
        expect(parseCount(5)).toBe(0);
    });
    it("compteur valide", () => {
        expect(parseCount({ n: 4 })).toBe(4);
    });
    it("compteur corrompu → 0", () => {
        expect(parseCount({ n: "4" })).toBe(0);
    });
});

describe("decideIp", () => {
    it("accepte et incrémente jour + rafale", () => {
        expect(decideIp({ day: 1, win: 5, burst: 1 }, 5, CFG)).toEqual({
            ok: true,
            next: { day: 2, win: 5, burst: 2 },
        });
    });
    it("refuse la rafale dans la même minute", () => {
        expect(decideIp({ day: 1, win: 5, burst: 2 }, 5, CFG)).toEqual({
            ok: false,
            reason: "burst",
        });
    });
    it("nouvelle minute : rafale remise à zéro", () => {
        expect(decideIp({ day: 1, win: 5, burst: 2 }, 6, CFG)).toEqual({
            ok: true,
            next: { day: 2, win: 6, burst: 1 },
        });
    });
    it("refuse au quota quotidien", () => {
        expect(decideIp({ day: 3, win: 1, burst: 0 }, 6, CFG)).toEqual({
            ok: false,
            reason: "daily",
        });
    });
});

describe("decideGlobal", () => {
    it("accepte sous le plafond", () => {
        expect(decideGlobal(9, CFG)).toEqual({ ok: true, next: 10 });
    });
    it("refuse au plafond", () => {
        expect(decideGlobal(10, CFG)).toEqual({ ok: false, reason: "global" });
    });
});

describe("remboursements", () => {
    it("rend le crédit du jour et la place de rafale", () => {
        expect(refundIpState({ day: 2, win: 5, burst: 2 })).toEqual({
            day: 1,
            win: 5,
            burst: 1,
        });
    });
    it("jamais négatif (IP)", () => {
        expect(refundIpState({ day: 0, win: 0, burst: 0 })).toEqual({
            day: 0,
            win: 0,
            burst: 0,
        });
    });
    it("compteur global", () => {
        expect(refundCount(3)).toBe(2);
    });
    it("jamais négatif (global)", () => {
        expect(refundCount(0)).toBe(0);
    });
});

describe("casBackoffMs / retryAfterFor", () => {
    it("exponentiel avec gigue", () => {
        expect(casBackoffMs(0, 0)).toBe(5);
        expect(casBackoffMs(2, 0.5)).toBe(40);
    });
    it("borné à 250 ms", () => {
        expect(casBackoffMs(10, 0.99)).toBe(250);
    });
    it("rafale : 60 s", () => {
        expect(retryAfterFor("burst", NOON)).toBe(60);
    });
    it("quota du jour : jusqu'à minuit UTC", () => {
        expect(retryAfterFor("daily", NOON)).toBe(43_200);
        expect(retryAfterFor("global", NOON)).toBe(43_200);
        // 12:00 UTC = 13:00 in Paris (CET, November): 11 h until the Paris midnight.
        expect(retryAfterFor("daily", NOON, "Europe/Paris")).toBe(39_600);
    });
});
