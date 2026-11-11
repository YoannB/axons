import { LOCALES, resolveDefaultLocale, resolveLocales, SUPPORTED_LOCALES } from "@/i18n/locales";
import { describe, expect, it } from "vitest";

describe("resolveDefaultLocale — NEXT_PUBLIC_DEFAULT_LOCALE", () => {
    it.each([undefined, "", "   "])("falls back to en when the variable is missing or empty (%j)", (raw) => {
        expect(resolveDefaultLocale(raw)).toBe("en");
    });

    it("accepts a served language, whitespace trimmed", () => {
        expect(resolveDefaultLocale(" fr ")).toBe("fr");
    });

    it("rejects a language outside the list instead of silently falling back", () => {
        expect(() => resolveDefaultLocale("nl")).toThrow(/Invalid NEXT_PUBLIC_DEFAULT_LOCALE: "nl"/);
    });

    it("single-language site: only the served language is accepted", () => {
        expect(resolveDefaultLocale("fr", ["fr"])).toBe("fr");
        expect(() => resolveDefaultLocale("en", ["fr"])).toThrow(/"en" is not in \[fr\]/);
    });

    it("no variable and en not served: the first served language", () => {
        expect(resolveDefaultLocale(undefined, ["fr", "de"])).toBe("fr");
    });

    it("the default value is one of the served languages", () => {
        expect(LOCALES).toContain(resolveDefaultLocale(undefined));
    });
});

describe("resolveLocales — NEXT_PUBLIC_LOCALES", () => {
    it.each([undefined, "", " , "])("serves every language when the variable is empty (%j)", (raw) => {
        expect(resolveLocales(raw)).toEqual(SUPPORTED_LOCALES);
    });

    it("keeps the given order, trims whitespace and removes duplicates", () => {
        expect(resolveLocales(" fr, en ,fr")).toEqual(["fr", "en"]);
    });

    it("rejects an unknown code instead of silently dropping it", () => {
        expect(() => resolveLocales("fr,nl,xx")).toThrow(/Invalid NEXT_PUBLIC_LOCALES: "nl", "xx"/);
    });

    it("by default, LOCALES = every supported language", () => {
        expect(LOCALES).toEqual(SUPPORTED_LOCALES);
    });
});
