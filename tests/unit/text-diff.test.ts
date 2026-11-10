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

describe("token predicates", () => {
    it("isWhitespace recognizes whitespace only", () => {
        expect(isWhitespace(" \n\t")).toBe(true);
        expect(isWhitespace(" a ")).toBe(false);
    });
    it("isPunctuation recognizes punctuation only", () => {
        expect(isPunctuation("?!")).toBe(true);
        expect(isPunctuation("a,")).toBe(false);
    });
    it("isWord requires a letter or a digit", () => {
        expect(isWord("été")).toBe(true);
        expect(isWord("42")).toBe(true);
        expect(isWord("…")).toBe(false);
    });
});

describe("tokenize", () => {
    it("keeps whitespace and splits punctuation from words", () => {
        expect(tokenize("Bonjour, le monde !\n")).toEqual(["Bonjour", ",", " ", "le", " ", "monde", " ", "!", "\n"]);
    });
    it("ignores empty chunks (empty text or leading whitespace)", () => {
        expect(tokenize("")).toEqual([]);
        expect(tokenize(" a")).toEqual([" ", "a"]);
    });
    it("keeps emojis as punctuation", () => {
        expect(tokenize("ok🙌")).toEqual(["ok", "🙌"]);
    });
});

describe("skeletonOf", () => {
    it("ignores case, accents and apostrophes", () => {
        expect(skeletonOf("L’Équipe")).toBe("lequipe");
    });
    it("returns the same value from the cache", () => {
        expect(skeletonOf("Côté")).toBe(skeletonOf("Côté"));
    });
    it("clears the cache beyond its capacity without losing correctness", () => {
        for (let k = 0; k < 5001; k++) skeletonOf(`w${k}`);
        expect(skeletonOf("Été")).toBe("ete");
    });
});

describe("diffWords", () => {
    it("identical texts => only equal", () => {
        const ops = diffWords("a b", "a b");
        expect(ops.every((o) => o.type === "equal")).toBe(true);
    });
    it("replaced word => replace with the old text", () => {
        expect(diffWords("le chien", "le chat")).toEqual([
            { type: "equal", text: "le" },
            { type: "equal", text: " " },
            { type: "replace", text: "chat", old: "chien" },
        ]);
    });
    it("fixed accent (same skeleton) => visible replace, not equal", () => {
        expect(diffWords("cote", "côté")).toEqual([{ type: "replace", text: "côté", old: "cote" }]);
    });
    it("inserted punctuation => insert", () => {
        expect(diffWords("Bonjour", "Bonjour,")).toEqual([
            { type: "equal", text: "Bonjour" },
            { type: "insert", text: "," },
        ]);
    });
    it("word deleted at the end => delete", () => {
        const ops = diffWords("a b", "a");
        expect(ops).toEqual([
            { type: "equal", text: "a" },
            { type: "delete", text: " " },
            { type: "delete", text: "b" },
        ]);
    });
    it("empty text on one side => only inserts or deletes", () => {
        expect(diffWords("", "a").map((o) => o.type)).toEqual(["insert"]);
        expect(diffWords("a", "").map((o) => o.type)).toEqual(["delete"]);
    });
    it("a whitespace change stays an explicit delete/insert (no replace)", () => {
        const ops = diffWords("a b", "a\nb");
        expect(ops.some((o) => o.type === "replace")).toBe(false);
        expect(rebuildAfter(ops)).toBe("a\nb");
    });
    it("word delete followed by a whitespace insert => no merge", () => {
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
    it("rebuilds the after text exactly", () => {
        expect(rebuildAfter(ops)).toBe(after);
    });
    it("rebuilds the before text exactly", () => {
        expect(rebuildBefore(ops)).toBe(before);
    });
});
