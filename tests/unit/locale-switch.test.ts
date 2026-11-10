// @vitest-environment node
import { switchTarget } from "@/lib/locale-switch";
import { describe, expect, it } from "vitest";

describe("switchTarget", () => {
    it("garde la clé logique d'une route statique (le routage la traduit)", () => {
        expect(switchTarget("/privacy", null)).toEqual({ pathname: "/privacy" });
    });

    it("prend le paramètre traduit dans l'alternate hreflang de la locale cible", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/fr/articles/ecrire-un-article")).toEqual({
            pathname: "/articles/[slug]",
            params: { slug: "ecrire-un-article" },
        });
    });

    it("décode un segment encodé", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/de/artikel/%C3%BCber")).toEqual({
            pathname: "/articles/[slug]",
            params: { slug: "über" },
        });
    });

    it("sans alternate (pas de traduction), remonte à la route parente", () => {
        expect(switchTarget("/articles/[slug]", null)).toEqual({ pathname: "/articles" });
    });

    it("alternate sans segment exploitable : route parente", () => {
        expect(switchTarget("/articles/[slug]", "https://example.com/")).toEqual({ pathname: "/articles" });
    });

    it("paramètre à la racine : la parente est l'accueil", () => {
        expect(switchTarget("/[slug]", null)).toEqual({ pathname: "/" });
    });

    it("route dynamique non terminale (non gérée) : accueil", () => {
        expect(switchTarget("/[category]/list", "https://example.com/fr/x/list")).toEqual({ pathname: "/" });
    });
});
