import { LOCALES, resolveDefaultLocale } from "@/i18n/locales";
import { describe, expect, it } from "vitest";

describe("resolveDefaultLocale — NEXT_PUBLIC_DEFAULT_LOCALE", () => {
    it.each([undefined, "", "   "])("retombe sur en quand la variable est absente ou vide (%j)", (raw) => {
        expect(resolveDefaultLocale(raw)).toBe("en");
    });

    it("accepte une langue servie, espaces retirés", () => {
        expect(resolveDefaultLocale(" fr ")).toBe("fr");
    });

    it("rejette une langue hors de la liste au lieu de se replier en silence", () => {
        expect(() => resolveDefaultLocale("nl")).toThrow(/NEXT_PUBLIC_DEFAULT_LOCALE invalide : "nl"/);
    });

    it("site monolingue : seule la langue servie est acceptée", () => {
        expect(resolveDefaultLocale("fr", ["fr"])).toBe("fr");
        expect(() => resolveDefaultLocale(undefined, ["fr"])).toThrow(/"en" n'est pas dans \[fr\]/);
    });

    it("la valeur par défaut fait partie des langues servies", () => {
        expect(LOCALES).toContain(resolveDefaultLocale(undefined));
    });
});
