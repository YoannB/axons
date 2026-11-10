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
    it("undefined → fallback", () => {
        expect(parseNonNegativeInt(undefined, 7)).toBe(7);
    });
    it("empty/blank string → fallback", () => {
        expect(parseNonNegativeInt("  ", 7)).toBe(7);
    });
    it("valid integer", () => {
        expect(parseNonNegativeInt("42", 7)).toBe(42);
    });
    it("zero accepted", () => {
        expect(parseNonNegativeInt("0", 7)).toBe(0);
    });
    it("negative → fallback", () => {
        expect(parseNonNegativeInt("-1", 7)).toBe(7);
    });
    it("decimal → fallback", () => {
        expect(parseNonNegativeInt("2.5", 7)).toBe(7);
    });
    it("non-numeric → fallback", () => {
        expect(parseNonNegativeInt("abc", 7)).toBe(7);
    });
});

describe("readQuotaConfig", () => {
    it("default values, fail-closed", () => {
        expect(readQuotaConfig({}, 3)).toEqual({
            dailyLimit: 3,
            globalCap: DEFAULT_GLOBAL_CAP,
            perMinute: DEFAULT_PER_MINUTE,
            failMode: "closed",
            timeZone: "UTC",
        });
    });
    it("reads the variables and the explicit fail-open", () => {
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
    it("any other fail mode value stays closed", () => {
        expect(readQuotaConfig({ AI_QUOTA_FAIL_MODE: "OPEN" }, 3).failMode).toBe("closed");
    });
});

describe("time and keys", () => {
    it("quotaDay = UTC day by default", () => {
        expect(quotaDay(Date.parse("2026-11-05T23:59:59Z"))).toBe("2026-11-05");
    });
    it("quotaDay follows the configured time zone", () => {
        expect(quotaDay(Date.parse("2026-11-05T23:30:00Z"), "Europe/Paris")).toBe("2026-11-06");
    });
    it("minuteIndex", () => {
        expect(minuteIndex(120_001)).toBe(2);
    });
    it("seconds until UTC midnight", () => {
        expect(secondsUntilQuotaMidnight(NOON)).toBe(43_200);
    });
    it("at exactly midnight: a full day", () => {
        expect(secondsUntilQuotaMidnight(Date.parse("2026-11-05T00:00:00Z"))).toBe(86_400);
    });
    it("last millisecond: at least 1 s", () => {
        expect(secondsUntilQuotaMidnight(Date.parse("2026-11-05T23:59:59.999Z"))).toBe(1);
    });
    it("keys prefixed by the day", () => {
        expect(ipKey("2026-11-05", "abc")).toBe("2026-11-05/ip/abc");
        expect(globalKey("2026-11-05")).toBe("2026-11-05/global");
    });
});

describe("staleDays", () => {
    it("keeps past days, ignores today, the future and foreign names", () => {
        expect(
            staleDays(["2026-11-03", "2026-11-04/", "2026-11-05", "2026-11-06", "misc", "2026-1-1"], "2026-11-05"),
        ).toEqual(["2026-11-03", "2026-11-04"]);
    });
});

describe("normalizeIp", () => {
    it("IPv4 unchanged (trim)", () => {
        expect(normalizeIp(" 203.0.113.7 ")).toBe("203.0.113.7");
    });
    it("IPv4-mapped IPv6 → IPv4", () => {
        expect(normalizeIp("::FFFF:203.0.113.7")).toBe("203.0.113.7");
    });
    it("full IPv6 → /64 prefix", () => {
        expect(normalizeIp("2001:0db8:0000:0042:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:0:42::/64");
    });
    it("compressed IPv6, zone removed", () => {
        expect(normalizeIp("2001:DB8::1%eth0")).toBe("2001:db8:0:0::/64");
    });
    it("IPv6 starting with ::", () => {
        expect(normalizeIp("::1")).toBe("0:0:0:0::/64");
    });
    it("IPv6 with embedded IPv4", () => {
        expect(normalizeIp("64:ff9b:1:2::192.0.2.1")).toBe("64:ff9b:1:2::/64");
    });
    it("two '::' → invalid, returned as is", () => {
        expect(normalizeIp("1::2::3")).toBe("1::2::3");
    });
    it("'::' with no missing group → invalid", () => {
        expect(normalizeIp("1:2:3:4:5:6:7:8::")).toBe("1:2:3:4:5:6:7:8::");
    });
    it("too few groups without '::' → invalid", () => {
        expect(normalizeIp("1:2:3")).toBe("1:2:3");
    });
    it("non-hexadecimal group → invalid", () => {
        expect(normalizeIp("gggg::1")).toBe("gggg::1");
    });
    it("non-IP value (dev) unchanged", () => {
        expect(normalizeIp("local")).toBe("local");
    });
});

describe("hashIp", () => {
    const SECRET = "s".repeat(32);
    it("deterministic, 22 base64url characters, without the IP in clear", () => {
        const h = hashIp("203.0.113.7", SECRET);
        expect(h).toBe(hashIp("203.0.113.7", SECRET));
        expect(h).toMatch(/^[A-Za-z0-9_-]{22}$/);
        expect(h).not.toContain("203");
    });
    it("depends on the secret", () => {
        expect(hashIp("203.0.113.7", "a".repeat(32))).not.toBe(hashIp("203.0.113.7", "b".repeat(32)));
    });
    it("two addresses in the same /64 share the identity", () => {
        expect(hashIp("2001:db8::1", SECRET)).toBe(hashIp("2001:db8::ffff:2", SECRET));
    });
});

describe("parseIpState / parseCount", () => {
    it("missing → zero", () => {
        expect(parseIpState(undefined)).toEqual({ day: 0, win: 0, burst: 0 });
    });
    it("non-object → zero", () => {
        expect(parseIpState("x")).toEqual({ day: 0, win: 0, burst: 0 });
    });
    it("valid", () => {
        expect(parseIpState({ day: 2, win: 9, burst: 1 })).toEqual({
            day: 2,
            win: 9,
            burst: 1,
        });
    });
    it("corrupted fields → zero", () => {
        expect(parseIpState({ day: -3, win: "9", burst: 1.5 })).toEqual({
            day: 0,
            win: 0,
            burst: 0,
        });
    });
    it("missing counter → 0", () => {
        expect(parseCount(null)).toBe(0);
    });
    it("non-object counter → 0", () => {
        expect(parseCount(5)).toBe(0);
    });
    it("valid counter", () => {
        expect(parseCount({ n: 4 })).toBe(4);
    });
    it("corrupted counter → 0", () => {
        expect(parseCount({ n: "4" })).toBe(0);
    });
});

describe("decideIp", () => {
    it("accepts and increments day + burst", () => {
        expect(decideIp({ day: 1, win: 5, burst: 1 }, 5, CFG)).toEqual({
            ok: true,
            next: { day: 2, win: 5, burst: 2 },
        });
    });
    it("denies the burst within the same minute", () => {
        expect(decideIp({ day: 1, win: 5, burst: 2 }, 5, CFG)).toEqual({
            ok: false,
            reason: "burst",
        });
    });
    it("new minute: burst reset to zero", () => {
        expect(decideIp({ day: 1, win: 5, burst: 2 }, 6, CFG)).toEqual({
            ok: true,
            next: { day: 2, win: 6, burst: 1 },
        });
    });
    it("denies at the daily quota", () => {
        expect(decideIp({ day: 3, win: 1, burst: 0 }, 6, CFG)).toEqual({
            ok: false,
            reason: "daily",
        });
    });
});

describe("decideGlobal", () => {
    it("accepts under the cap", () => {
        expect(decideGlobal(9, CFG)).toEqual({ ok: true, next: 10 });
    });
    it("denies at the cap", () => {
        expect(decideGlobal(10, CFG)).toEqual({ ok: false, reason: "global" });
    });
});

describe("refunds", () => {
    it("returns the day credit and the burst slot", () => {
        expect(refundIpState({ day: 2, win: 5, burst: 2 })).toEqual({
            day: 1,
            win: 5,
            burst: 1,
        });
    });
    it("never negative (IP)", () => {
        expect(refundIpState({ day: 0, win: 0, burst: 0 })).toEqual({
            day: 0,
            win: 0,
            burst: 0,
        });
    });
    it("global counter", () => {
        expect(refundCount(3)).toBe(2);
    });
    it("never negative (global)", () => {
        expect(refundCount(0)).toBe(0);
    });
});

describe("casBackoffMs / retryAfterFor", () => {
    it("exponential with jitter", () => {
        expect(casBackoffMs(0, 0)).toBe(5);
        expect(casBackoffMs(2, 0.5)).toBe(40);
    });
    it("capped at 250 ms", () => {
        expect(casBackoffMs(10, 0.99)).toBe(250);
    });
    it("burst: 60 s", () => {
        expect(retryAfterFor("burst", NOON)).toBe(60);
    });
    it("daily quota: until UTC midnight", () => {
        expect(retryAfterFor("daily", NOON)).toBe(43_200);
        expect(retryAfterFor("global", NOON)).toBe(43_200);
        // 12:00 UTC = 13:00 in Paris (CET, November): 11 h until the Paris midnight.
        expect(retryAfterFor("daily", NOON, "Europe/Paris")).toBe(39_600);
    });
});
