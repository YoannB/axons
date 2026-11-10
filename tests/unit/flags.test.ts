// @vitest-environment node
import { isAiEnabled, isConsentRequired } from "@/lib/flags";
import { describe, expect, it } from "vitest";

describe("isAiEnabled", () => {
    it("clé vue au build et limite positive => actif", () => {
        expect(isAiEnabled("true", 3)).toBe(true);
    });
    it.each([
        ["false", 3],
        [undefined, 3],
        ["TRUE", 3],
        ["true", 0],
        ["true", -1],
    ] as const)("sinon inactif (%j, %j)", (flag, limit) => {
        expect(isAiEnabled(flag, limit)).toBe(false);
    });
});

describe("isConsentRequired", () => {
    it("aucun traceur configuré => pas de bandeau", () => {
        expect(isConsentRequired({ gtmId: "", adsEnabled: false })).toBe(false);
        expect(isConsentRequired({ gtmId: "   ", adsEnabled: false })).toBe(false);
    });
    it("un identifiant GTM => bandeau", () => {
        expect(isConsentRequired({ gtmId: "GTM-ABC123", adsEnabled: false })).toBe(true);
    });
    it("la publicité activée => bandeau", () => {
        expect(isConsentRequired({ gtmId: "", adsEnabled: true })).toBe(true);
    });
});
