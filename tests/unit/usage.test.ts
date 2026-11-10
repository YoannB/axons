// @vitest-environment node
import { canCall, normalizeUsage, remaining, todayISO } from "@/lib/usage";
import { describe, expect, it } from "vitest";

const NOT_TODAY = "1970-01-01";

describe("todayISO", () => {
    it("formats a given date as YYYY-MM-DD UTC", () => {
        expect(todayISO(new Date("2026-10-20T23:59:59.999Z"))).toBe("2026-10-20");
    });

    it("uses the current date by default", () => {
        expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("normalizeUsage — reset branch (!raw || raw.date !== t)", () => {
    it("resets for null", () => {
        const today = todayISO();

        expect(normalizeUsage(null)).toEqual({
            date: today,
            count: 0,
        });
    });

    it("resets for undefined", () => {
        const today = todayISO();

        expect(normalizeUsage(undefined)).toEqual({
            date: today,
            count: 0,
        });
    });

    it("resets when the stored date is not today", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: NOT_TODAY, count: 99 })).toEqual({
            date: today,
            count: 0,
        });
    });
});

describe("normalizeUsage — keep branch and counter coercion", () => {
    it("keeps a valid numeric counter", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: 3 })).toEqual({
            date: today,
            count: 3,
        });
    });

    it("coerces a numeric string", () => {
        const today = todayISO();

        expect(
            normalizeUsage({
                date: today,
                count: "7" as unknown as number,
            }).count,
        ).toBe(7);
    });

    it("replaces NaN with 0", () => {
        const today = todayISO();

        expect(
            normalizeUsage({
                date: today,
                count: "abc" as unknown as number,
            }).count,
        ).toBe(0);
    });

    it("replaces undefined with 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today }).count).toBe(0);
    });

    it("clamps a negative counter to 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: -5 }).count).toBe(0);
    });

    it("keeps 0 as 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: 0 }).count).toBe(0);
    });
});

describe("remaining", () => {
    it("returns the positive difference", () => {
        expect(remaining({ date: "2026-10-20", count: 2 }, 5)).toBe(3);
    });

    it("returns 0 when equal", () => {
        expect(remaining({ date: "2026-10-20", count: 5 }, 5)).toBe(0);
    });

    it("returns 0 when exceeded", () => {
        expect(remaining({ date: "2026-10-20", count: 6 }, 5)).toBe(0);
    });
});

describe("canCall — && short-circuit branches", () => {
    it("returns false when the limit is zero", () => {
        expect(canCall({ date: "2026-10-20", count: 0 }, 0)).toBe(false);
    });

    it("returns false when the limit is negative", () => {
        expect(canCall({ date: "2026-10-20", count: 0 }, -1)).toBe(false);
    });

    it("returns true when the limit is positive and the remainder positive", () => {
        expect(canCall({ date: "2026-10-20", count: 4 }, 5)).toBe(true);
    });

    it("returns false when the quota is exhausted", () => {
        expect(canCall({ date: "2026-10-20", count: 5 }, 5)).toBe(false);
    });

    it("returns false when exceeded", () => {
        expect(canCall({ date: "2026-10-20", count: 6 }, 5)).toBe(false);
    });
});
