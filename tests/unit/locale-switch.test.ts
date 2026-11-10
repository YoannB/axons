// @vitest-environment node
import { switchTarget } from "@/lib/locale-switch";
import { describe, expect, it } from "vitest";

describe("switchTarget", () => {
    it("keeps the logical key of a static route (routing translates it)", () => {
        expect(switchTarget("/privacy", null)).toEqual({ pathname: "/privacy" });
    });

    it("takes the translated param from the target locale's hreflang alternate", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/fr/articles/ecrire-un-article")).toEqual({
            pathname: "/articles/[slug]",
            params: { slug: "ecrire-un-article" },
        });
    });

    it("decodes an encoded segment", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/de/artikel/%C3%BCber")).toEqual({
            pathname: "/articles/[slug]",
            params: { slug: "über" },
        });
    });

    it("without alternate (no translation), goes up to the parent route", () => {
        expect(switchTarget("/articles/[slug]", null)).toEqual({ pathname: "/articles" });
    });

    it("alternate without a usable segment: parent route", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/")).toEqual({ pathname: "/articles" });
    });

    it("param at the root: the parent is home", () => {
        expect(switchTarget("/[slug]", null)).toEqual({ pathname: "/" });
    });

    it("non-terminal dynamic route (unsupported): home", () => {
        expect(switchTarget("/[category]/list", "https://example.com/fr/x/list")).toEqual({ pathname: "/" });
    });
});
