// @vitest-environment node
import { dayIn, DEFAULT_TIME_ZONE, resolveTimeZone, secondsUntilMidnightIn } from "@/lib/day";
import { describe, expect, it } from "vitest";

describe("resolveTimeZone — NEXT_PUBLIC_AI_QUOTA_TZ", () => {
    it.each([undefined, "", "   "])("UTC par défaut (%j)", (raw) => {
        expect(resolveTimeZone(raw)).toBe(DEFAULT_TIME_ZONE);
    });
    it("accepte un fuseau IANA, espaces retirés", () => {
        expect(resolveTimeZone(" Europe/Paris ")).toBe("Europe/Paris");
    });
    it("rejette un fuseau inconnu au lieu de se replier en silence", () => {
        expect(() => resolveTimeZone("Mars/Olympus")).toThrow(/NEXT_PUBLIC_AI_QUOTA_TZ invalide : "Mars\/Olympus"/);
    });
});

describe("dayIn", () => {
    const LATE_UTC = Date.parse("2026-11-05T23:30:00Z");
    it("UTC par défaut, identique à toISOString", () => {
        expect(dayIn(LATE_UTC)).toBe("2026-11-05");
    });
    it("bascule au jour suivant à l'est de Greenwich", () => {
        expect(dayIn(LATE_UTC, "Europe/Paris")).toBe("2026-11-06");
    });
    it("reste la veille à l'ouest", () => {
        expect(dayIn(Date.parse("2026-11-06T03:00:00Z"), "America/New_York")).toBe("2026-11-05");
    });
    it("réutilise le formateur du fuseau (appels répétés cohérents)", () => {
        expect(dayIn(LATE_UTC, "Europe/Paris")).toBe(dayIn(LATE_UTC, "Europe/Paris"));
    });
});

describe("secondsUntilMidnightIn", () => {
    it("midi UTC : 12 h", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T12:00:00Z"))).toBe(43_200);
    });
    it("minuit pile : un jour entier", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T00:00:00Z"))).toBe(86_400);
    });
    it("dernière milliseconde : au moins 1 s", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T23:59:59.999Z"))).toBe(1);
    });
    it("suit le fuseau : 12:00 UTC = 13:00 à Paris en novembre", () => {
        expect(secondsUntilMidnightIn(Date.parse("2026-11-05T12:00:00Z"), "Europe/Paris")).toBe(39_600);
    });
});
