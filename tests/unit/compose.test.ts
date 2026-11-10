import { composeRun } from "@/lib/ai/compose";
import { parseAgent } from "@/lib/ai/parse-agent";
import { parseSkill } from "@/lib/ai/parse-skill";
import type { LoadedSkill } from "@/lib/ai/skill-pure";
import { describe, expect, it } from "vitest";

// BASELINE: PURE composition, no fs/network/mock. Each it locks ONE branch of
// composeRun (required prompt, agent/skill/resources sections, tolerant filter, precedence
// by source, inputs substitution). Fixtures are really parsed (not literals) to also exercise
// parse-agent/parse-skill. NB: top-level fixtures MUST have their closing `---`
// (the parser fails fast on the frontmatter) — an omission crashes the whole module
// at import (const evaluated before any `it`), hence a "0 test / Failed Suites".

const AGENT = parseAgent(`---
id: hello
name: Greeting
model: acme/pro
temperature: 0.5
maxTokens: 120
timeoutMs: 9000
---
Reply in {locale}.
`);
const SKILL_BASE = parseSkill(`---
name: i18n-copy
description: d
inputs: [locale, namespace]
outputs: [messages patch]
model: acme/copy
temperature: 0.2
maxTokens: 1500
timeoutMs: 12000
---
Do {namespace} in {locale}.
`);
const skillWith = (resources: { relPath: string; content: string }[]): LoadedSkill => ({
    ...SKILL_BASE,
    id: "i18n-copy",
    resources,
});

describe("composeRun — prompt obligatoire", () => {
    it("lève sur prompt vide (branche !user)", () => {
        expect(() => composeRun({ prompt: "" })).toThrow(/prompt/);
    });
    it("lève sur prompt whitespace seulement", () => {
        expect(() => composeRun({ prompt: "   \n " })).toThrow(/prompt/);
    });
    it("prompt seul => message user seul + DEFAULTS (branche !system, src undefined)", () => {
        const c = composeRun({ prompt: " hi " });
        expect(c.messages).toEqual([{ role: "user", content: "hi" }]);
        expect(c).toMatchObject({
            model: "openrouter/free",
            temperature: 0.7,
            maxTokens: 300,
            timeoutMs: 25000,
        });
    });
});

describe("composeRun — sections du system", () => {
    it("agent seul => section Agent profile rendue, params de l'agent", () => {
        const c = composeRun({
            prompt: "t",
            agent: AGENT,
            inputs: { locale: "fr" },
        });
        expect(c.messages[0]).toEqual({
            role: "system",
            content: "## Agent profile\nReply in fr.",
        });
        expect(c.messages[1]).toEqual({ role: "user", content: "t" });
        expect(c).toMatchObject({
            model: "acme/pro",
            temperature: 0.5,
            maxTokens: 120,
            timeoutMs: 9000,
        });
    });
    it("skill seul => section Skill procedure (+ resources absentes => pas de section resources)", () => {
        const c = composeRun({
            prompt: "t",
            skill: skillWith([]),
            inputs: { locale: "fr", namespace: "nav" },
        });
        expect(c.messages[0]!.content).toContain("## Skill procedure\nDo nav in fr.");
        expect(c.messages[0]!.content).not.toContain("## Skill resources");
        expect(c).toMatchObject({
            model: "acme/copy",
            temperature: 0.2,
            maxTokens: 1500,
            timeoutMs: 12000,
        });
    });
    it("agent+skill => les deux sections, ordre agent puis skill", () => {
        const c = composeRun({
            prompt: "t",
            agent: AGENT,
            skill: skillWith([]),
            inputs: { locale: "en", namespace: "x" },
        });
        const sys = c.messages[0]!.content;
        expect(sys.indexOf("## Agent profile")).toBeLessThan(sys.indexOf("## Skill procedure"));
    });
    it("resources presentes => section Skill resources serialisee", () => {
        const c = composeRun({
            prompt: "t",
            skill: skillWith([{ relPath: "tool.json", content: "{}" }]),
            inputs: { locale: "fr", namespace: "n" },
        });
        expect(c.messages[0]!.content).toContain("## Skill resources\n### Resource: tool.json\n{}\n");
    });
});

describe("composeRun — filtre de ressources (tolérant)", () => {
    const skill = skillWith([
        { relPath: "a.md", content: "A" },
        { relPath: "b.json", content: "B" },
    ]);
    it("includeResources restreint aux relPaths demandes", () => {
        const c = composeRun({
            prompt: "t",
            skill,
            inputs: { locale: "fr", namespace: "n" },
            includeResources: ["b.json"],
        });
        const sys = c.messages[0]!.content;
        expect(sys).toContain("### Resource: b.json");
        expect(sys).not.toContain("### Resource: a.md");
    });
    it("chemin demande mais absent => ignore sans crash (branche filter)", () => {
        const c = composeRun({
            prompt: "t",
            skill,
            inputs: { locale: "fr", namespace: "n" },
            includeResources: ["zzz.md"],
        });
        expect(c.messages[0]!.content).not.toContain("## Skill resources");
    });
    it("includeResources absent => toutes les ressources (branche !include)", () => {
        const c = composeRun({
            prompt: "t",
            skill,
            inputs: { locale: "fr", namespace: "n" },
        });
        const sys = c.messages[0]!.content;
        expect(sys).toContain("### Resource: a.md");
        expect(sys).toContain("### Resource: b.json");
    });
});

describe("composeRun — precedence des params (par source entiere)", () => {
    it("agent present => ses params gagnent sur le skill (branche src=agent)", () => {
        const c = composeRun({
            prompt: "t",
            agent: AGENT,
            skill: skillWith([]),
            inputs: { locale: "fr", namespace: "n" },
        });
        expect(c.model).toBe("acme/pro");
        expect(c.temperature).toBe(0.5);
    });
    it("sans agent, skill present => params du skill (branche src=skill)", () => {
        const c = composeRun({
            prompt: "t",
            skill: skillWith([]),
            inputs: { locale: "fr", namespace: "n" },
        });
        expect(c.model).toBe("acme/copy");
    });
});

describe("composeRun — substitution inputs", () => {
    it("les placeholders inconnus deviennent vides dans agent ET skill (?? '')", () => {
        const c = composeRun({
            prompt: "t",
            agent: AGENT,
            skill: skillWith([]),
            inputs: {},
        });
        expect(c.messages[0]!.content).toContain("Reply in .");
        expect(c.messages[0]!.content).toContain("Do  in .");
    });
});
