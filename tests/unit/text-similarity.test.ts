// @vitest-environment node
import { diffWords } from "@/lib/text/diff";
import { bandFor, DEFAULT_BANDS, diffStats, similarityPercent } from "@/lib/text/similarity";
import { describe, expect, it } from "vitest";

describe("diffStats", () => {
    it("compte insert, delete et replace, ignore equal et blancs", () => {
        expect(
            diffStats([
                { type: "equal", text: "a" },
                { type: "insert", text: " " },
                { type: "insert", text: "," },
                { type: "delete", text: " " },
                { type: "delete", text: "b" },
                { type: "replace", text: "c", old: "d" },
            ]),
        ).toEqual({ inserted: 1, deleted: 1, replaced: 1, changed: 3 });
    });
});

describe("similarityPercent", () => {
    it("100 pour deux textes identiques", () => {
        expect(similarityPercent(diffWords("a b c", "a b c"), "a b c", "a b c")).toBe(100);
    });
    it("100 pour deux textes vides (dénominateur minimal à 1)", () => {
        expect(similarityPercent([], "", "")).toBe(100);
    });
    it("un mot changé sur quatre => 75", () => {
        const before = "un deux trois quatre";
        const after = "un deux trois cinq";
        expect(similarityPercent(diffWords(before, after), before, after)).toBe(75);
    });
    it("borné à 0 quand les changements dépassent le nombre de mots", () => {
        const ops = diffWords("a", "b, c; d!");
        expect(similarityPercent(ops, "a", "b, c; d!")).toBe(0);
    });
});

describe("bandFor", () => {
    it("bandes par défaut : 100 / 95 / 90 / en dessous", () => {
        expect(bandFor(100).key).toBe("perfect");
        expect(bandFor(97).key).toBe("great");
        expect(bandFor(90).key).toBe("good");
        expect(bandFor(12).key).toBe("low");
    });
    it("accepte des bandes personnalisées dans n'importe quel ordre", () => {
        const bands = [
            { key: "ko", min: 0 },
            { key: "ok", min: 50 },
        ] as const;
        expect(bandFor(60, bands).key).toBe("ok");
        expect(bandFor(10, bands).key).toBe("ko");
    });
    it("ne modifie pas le tableau fourni", () => {
        const copy = [...DEFAULT_BANDS];
        bandFor(50);
        expect(DEFAULT_BANDS).toEqual(copy);
    });
    it("lève une erreur si aucune bande ne couvre la valeur", () => {
        expect(() => bandFor(10, [{ key: "high", min: 50 }])).toThrow(/no band covers 10/);
        expect(() => bandFor(10, [])).toThrow();
    });
});
