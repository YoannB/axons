import { LOCALES, resolveDefaultLocale, resolveLocales, SUPPORTED_LOCALES } from "@/i18n/locales";
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
        expect(() => resolveDefaultLocale("en", ["fr"])).toThrow(/"en" n'est pas dans \[fr\]/);
    });

    it("sans variable et sans en servi : la première langue servie", () => {
        expect(resolveDefaultLocale(undefined, ["fr", "de"])).toBe("fr");
    });

    it("la valeur par défaut fait partie des langues servies", () => {
        expect(LOCALES).toContain(resolveDefaultLocale(undefined));
    });
});

describe("resolveLocales — NEXT_PUBLIC_LOCALES", () => {
    it.each([undefined, "", " , "])("sert toutes les langues quand la variable est vide (%j)", (raw) => {
        expect(resolveLocales(raw)).toEqual(SUPPORTED_LOCALES);
    });

    it("garde l'ordre donné, retire les espaces et les doublons", () => {
        expect(resolveLocales(" fr, en ,fr")).toEqual(["fr", "en"]);
    });

    it("rejette un code inconnu au lieu de le perdre en silence", () => {
        expect(() => resolveLocales("fr,nl,xx")).toThrow(/NEXT_PUBLIC_LOCALES invalide : "nl", "xx"/);
    });

    it("par défaut, LOCALES = toutes les langues supportées", () => {
        expect(LOCALES).toEqual(SUPPORTED_LOCALES);
    });
});
