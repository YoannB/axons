// @vitest-environment node
import { canCall, normalizeUsage, remaining, todayISO } from "@/lib/usage";
import { describe, expect, it } from "vitest";

const NOT_TODAY = "1970-01-01";

describe("todayISO", () => {
    it("formate une date fournie en AAAA-MM-JJ UTC", () => {
        expect(todayISO(new Date("2026-10-20T23:59:59.999Z"))).toBe("2026-10-20");
    });

    it("utilise la date courante par défaut", () => {
        expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe("normalizeUsage — branche de reset (!raw || raw.date !== t)", () => {
    it("réinitialise pour null", () => {
        const today = todayISO();

        expect(normalizeUsage(null)).toEqual({
            date: today,
            count: 0,
        });
    });

    it("réinitialise pour undefined", () => {
        const today = todayISO();

        expect(normalizeUsage(undefined)).toEqual({
            date: today,
            count: 0,
        });
    });

    it("réinitialise quand la date stockée n'est pas celle du jour", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: NOT_TODAY, count: 99 })).toEqual({
            date: today,
            count: 0,
        });
    });
});

describe("normalizeUsage — branche de conservation et coercition du compteur", () => {
    it("conserve un compteur numérique valide", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: 3 })).toEqual({
            date: today,
            count: 3,
        });
    });

    it("coerce une chaîne numérique", () => {
        const today = todayISO();

        expect(
            normalizeUsage({
                date: today,
                count: "7" as unknown as number,
            }).count,
        ).toBe(7);
    });

    it("remplace NaN par 0", () => {
        const today = todayISO();

        expect(
            normalizeUsage({
                date: today,
                count: "abc" as unknown as number,
            }).count,
        ).toBe(0);
    });

    it("remplace undefined par 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today }).count).toBe(0);
    });

    it("plafonne un compteur négatif à 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: -5 }).count).toBe(0);
    });

    it("garde 0 comme 0", () => {
        const today = todayISO();

        expect(normalizeUsage({ date: today, count: 0 }).count).toBe(0);
    });
});

describe("remaining", () => {
    it("retourne la différence positive", () => {
        expect(remaining({ date: "2026-10-20", count: 2 }, 5)).toBe(3);
    });

    it("retourne 0 à l'égalité", () => {
        expect(remaining({ date: "2026-10-20", count: 5 }, 5)).toBe(0);
    });

    it("retourne 0 en dépassement", () => {
        expect(remaining({ date: "2026-10-20", count: 6 }, 5)).toBe(0);
    });
});

describe("canCall — branches de court-circuit &&", () => {
    it("retourne false si la limite est nulle", () => {
        expect(canCall({ date: "2026-10-20", count: 0 }, 0)).toBe(false);
    });

    it("retourne false si la limite est négative", () => {
        expect(canCall({ date: "2026-10-20", count: 0 }, -1)).toBe(false);
    });

    it("retourne true si la limite est positive et le restant positif", () => {
        expect(canCall({ date: "2026-10-20", count: 4 }, 5)).toBe(true);
    });

    it("retourne false si le quota est épuisé", () => {
        expect(canCall({ date: "2026-10-20", count: 5 }, 5)).toBe(false);
    });

    it("retourne false en dépassement", () => {
        expect(canCall({ date: "2026-10-20", count: 6 }, 5)).toBe(false);
    });
});
