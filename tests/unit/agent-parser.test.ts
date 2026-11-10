import { parseAgent, renderPrompt } from "@/lib/ai/parse-agent";
import { describe, expect, it } from "vitest";

// Pure BASELINE (no fs/network/mock). NB: the `input` field no longer exists in the agent
// contract (unified model: prompt always required, see docs/ai-capabilities.md) — the cases that
// tested it were removed, not replaced by decorative ones.

const FULL = `---
id: hello
name: Salutation IA
model: openrouter/free
temperature: 0.7
maxTokens: 200
timeoutMs: 25000
---
Salue dans la langue {locale}.
`;

describe("parseAgent — chemin nominal", () => {
    it("extrait frontmatter + prompt (regex OK, toutes clés présentes)", () => {
        expect(parseAgent(FULL)).toEqual({
            id: "hello",
            name: "Salutation IA",
            model: "openrouter/free",
            temperature: 0.7,
            maxTokens: 200,
            timeoutMs: 25000,
            systemPrompt: "Salue dans la langue {locale}.",
        });
    });
    it("tolère CRLF", () => {
        expect(parseAgent(FULL.replace(/\n/g, "\r\n")).id).toBe("hello");
    });
    it("tolère BOM + blancs tête/queue", () => {
        expect(parseAgent("\uFEFF\n\n" + FULL + "\n\n").id).toBe("hello");
    });
    it("normalise espaces autour cle/valeur", () => {
        const a = parseAgent("---\n  id  :  hello  \n---\nb");
        expect(a.id).toBe("hello");
        expect(a.name).toBe("hello");
    });
    it("préserve un '---' interne au corps (capture lazy)", () => {
        expect(parseAgent("---\nid: x\n---\nintro\n---\nfin").systemPrompt).toBe("intro\n---\nfin");
    });
    it("corps vide => ''", () => {
        expect(parseAgent("---\nid: x\n---\n").systemPrompt).toBe("");
    });
});

describe("parseAgent — défauts (branche ?? DEFAULTS)", () => {
    it("n'exige que id", () => {
        expect(parseAgent("---\nid: x\n---\nbody")).toMatchObject({
            id: "x",
            name: "x",
            model: "openrouter/free",
            temperature: 0.7,
            maxTokens: 300,
            timeoutMs: 25000,
        });
    });
    it("ignore une ligne sans ': '", () => {
        expect(parseAgent("---\nid: x\ntemperature0.9\n---\nb").temperature).toBe(0.7);
    });
    it("coerce les numériques écrits en chaînes", () => {
        const a = parseAgent("---\nid: x\ntemperature: 0.9\nmaxTokens: 512\ntimeoutMs: 30000\n---\nb");
        expect(a.temperature).toBe(0.9);
        expect(a.maxTokens).toBe(512);
        expect(a.timeoutMs).toBe(30000);
    });
});

describe("parseAgent — erreurs d'auteur (branches throw)", () => {
    it("rejecte absence de '---' de clôture", () => {
        expect(() => parseAgent("---\nid: x\nbody")).toThrow(/frontmatter/);
    });
    it("rejecte absence de '---' de tête", () => {
        expect(() => parseAgent("id: x\n---\nbody")).toThrow(/frontmatter/);
    });
    it("rejecte chaîne vide", () => {
        expect(() => parseAgent("")).toThrow(/frontmatter/);
    });
    it("rejecte id absent", () => {
        expect(() => parseAgent("---\nname: y\n---\nbody")).toThrow(/id requis/);
    });
    it("rejecte id vide", () => {
        expect(() => parseAgent("---\nid:\n---\nbody")).toThrow(/id requis/);
    });
    it("rejecte température non finie (NaN)", () => {
        expect(() => parseAgent("---\nid: x\ntemperature: abc\n---\nb")).toThrow(/temperature/);
    });
    it("rejecte timeoutMs Infinity", () => {
        expect(() => parseAgent("---\nid: x\ntimeoutMs: Infinity\n---\nb")).toThrow(/timeoutMs/);
    });
    it("accepte maxTokens vide => 0 (Number('') fini, ne throw PAS)", () => {
        expect(parseAgent("---\nid: x\nmaxTokens: \n---\nb").maxTokens).toBe(0);
    });
});

describe("renderPrompt", () => {
    it("remplace les placeholders connus", () => {
        expect(renderPrompt("Hello {locale}", { locale: "fr" })).toBe("Hello fr");
    });
    it("vide les placeholders inconnus (?? '')", () => {
        expect(renderPrompt("A {missing} B", {})).toBe("A  B");
    });
    it("remplace chaque occurrence (/g)", () => {
        expect(renderPrompt("{x}-{x}", { x: "1" })).toBe("1-1");
    });
    it("ignore un placeholder avec espace (\\w+ ne matche pas)", () => {
        expect(renderPrompt("{a b} ok", { "a b": "z" })).toBe("{a b} ok");
    });
});
