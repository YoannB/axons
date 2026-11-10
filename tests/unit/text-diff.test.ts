// @vitest-environment node
import {
    diffWords,
    isPunctuation,
    isWhitespace,
    isWord,
    rebuildAfter,
    rebuildBefore,
    skeletonOf,
    tokenize,
    type DiffOp,
} from "@/lib/text/diff";
import { describe, expect, it } from "vitest";

describe("prédicats de token", () => {
    it("isWhitespace reconnaît les blancs seuls", () => {
        expect(isWhitespace(" \n\t")).toBe(true);
        expect(isWhitespace(" a ")).toBe(false);
    });
    it("isPunctuation reconnaît la ponctuation seule", () => {
        expect(isPunctuation("?!")).toBe(true);
        expect(isPunctuation("a,")).toBe(false);
    });
    it("isWord exige une lettre ou un chiffre", () => {
        expect(isWord("été")).toBe(true);
        expect(isWord("42")).toBe(true);
        expect(isWord("…")).toBe(false);
    });
});

describe("tokenize", () => {
    it("conserve les blancs et isole la ponctuation des mots", () => {
        expect(tokenize("Bonjour, le monde !\n")).toEqual(["Bonjour", ",", " ", "le", " ", "monde", " ", "!", "\n"]);
    });
    it("ignore les morceaux vides (texte vide ou blanc en tête)", () => {
        expect(tokenize("")).toEqual([]);
        expect(tokenize(" a")).toEqual([" ", "a"]);
    });
    it("garde les emojis comme ponctuation", () => {
        expect(tokenize("ok🙌")).toEqual(["ok", "🙌"]);
    });
});

describe("skeletonOf", () => {
    it("ignore casse, accents et apostrophes", () => {
        expect(skeletonOf("L’Équipe")).toBe("lequipe");
    });
    it("renvoie la même valeur depuis le cache", () => {
        expect(skeletonOf("Côté")).toBe(skeletonOf("Côté"));
    });
    it("vide le cache au-delà de sa capacité sans perdre la justesse", () => {
        for (let k = 0; k < 5001; k++) skeletonOf(`w${k}`);
        expect(skeletonOf("Été")).toBe("ete");
    });
});

describe("diffWords", () => {
    it("textes identiques => uniquement des equal", () => {
        const ops = diffWords("a b", "a b");
        expect(ops.every((o) => o.type === "equal")).toBe(true);
    });
    it("mot remplacé => replace avec l'ancien texte", () => {
        expect(diffWords("le chien", "le chat")).toEqual([
            { type: "equal", text: "le" },
            { type: "equal", text: " " },
            { type: "replace", text: "chat", old: "chien" },
        ]);
    });
    it("accent corrigé (même squelette) => replace visible, pas equal", () => {
        expect(diffWords("cote", "côté")).toEqual([{ type: "replace", text: "côté", old: "cote" }]);
    });
    it("ponctuation insérée => insert", () => {
        expect(diffWords("Bonjour", "Bonjour,")).toEqual([
            { type: "equal", text: "Bonjour" },
            { type: "insert", text: "," },
        ]);
    });
    it("mot supprimé en fin => delete", () => {
        const ops = diffWords("a b", "a");
        expect(ops).toEqual([
            { type: "equal", text: "a" },
            { type: "delete", text: " " },
            { type: "delete", text: "b" },
        ]);
    });
    it("texte vide d'un côté => uniquement des insert ou des delete", () => {
        expect(diffWords("", "a").map((o) => o.type)).toEqual(["insert"]);
        expect(diffWords("a", "").map((o) => o.type)).toEqual(["delete"]);
    });
    it("un changement de blanc reste un delete/insert explicite (pas de replace)", () => {
        const ops = diffWords("a b", "a\nb");
        expect(ops.some((o) => o.type === "replace")).toBe(false);
        expect(rebuildAfter(ops)).toBe("a\nb");
    });
    it("delete de mot suivi d'un insert de blanc => pas de fusion", () => {
        const ops: DiffOp[] = diffWords("x y", "y ");
        expect(ops.some((o) => o.type === "replace")).toBe(false);
        expect(rebuildAfter(ops)).toBe("y ");
        expect(rebuildBefore(ops)).toBe("x y");
    });
});

describe("rebuildAfter / rebuildBefore", () => {
    const before = "Tres beau partage ! Cela me rappel un projet.";
    const after = "Très beau partage ! Cela me rappelle un beau projet.";
    const ops = diffWords(before, after);
    it("reconstruit exactement le texte après", () => {
        expect(rebuildAfter(ops)).toBe(after);
    });
    it("reconstruit exactement le texte avant", () => {
        expect(rebuildBefore(ops)).toBe(before);
    });
});
