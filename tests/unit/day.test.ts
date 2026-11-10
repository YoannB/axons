// @vitest-environment node
import { dayIn, DEFAULT_TIME_ZONE, resolveTimeZone, secondsUntilMidnightIn } from "@/lib/day";
import { describe, expect, it } from "vitest";

describe("resolveTimeZone — NEXT_PUBLIC_AI_QUOTA_TZ", () => {
    it.each([undefined, "", "   "])("UTC by default (%j)", (raw) => {
        expect(resolveTimeZone(raw)).toBe(DEFAULT_TIME_ZONE);
    });
    it("accepts an IANA time zone, whitespace trimmed", () => {
        expect(resolveTimeZone(" Europe/Paris ")).toBe("Europe/Paris");
    });
    it("rejects an unknown time zone instead of silently falling back", () => {
        expect(() => resolveTimeZone("Mars/Olympus")).toThrow(/Invalid NEXT_PUBLIC_AI_QUOTA_TZ: "Mars\/Olympus"/);
    });
});

describe("dayIn", () => {
    const LATE_UTC = Date.parse("2026-11-05T23:30:00Z");
    it("UTC by default, identical to toISOString", () => {
        expect(dayIn(LATE_UTC)).toBe("2026-11-05");
    });
    it("rolls over to the next day east of Greenwich", () => {
        expect(dayIn(LATE_UTC, "Europe/Paris")).toBe("2026-11-06");
    });
    it("stays on the previous day to the west", () => {
        expect(dayIn(Date.parse("2026-11-06T03:00:00Z"), "America/New_York")).toBe("2026-11-05");
    });
    it("reuses the time zone formatter (repeated calls consistent)", () => {
        expect(dayIn(LATE_UTC, "Europe/Paris")).toBe(dayIn(LATE_UTC, "Europe/Paris"));
    });
});

describe("secondsUntilMidnightIn", () => {
    it("UTC noon: 12 h", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T12:00:00Z"))).toBe(43_200);
    });
    it("exactly midnight: a full day", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T00:00:00Z"))).toBe(86_400);
    });
    it("last millisecond: at least 1 s", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T23:59:59.999Z"))).toBe(1);
    });
    it("follows the time zone: 12:00 UTC = 13:00 in Paris in November", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T12:00:00Z"), "Europe/Paris")).toBe(39_600);
    });
});
