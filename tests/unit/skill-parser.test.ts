import { parseSkill } from "@/lib/ai/parse-skill";
import {
    assertCapabilityId,
    serializeSkillResources,
    validateSkillInputs,
    type SkillResource,
} from "@/lib/ai/skill-pure";
import { describe, expect, it } from "vitest";

const LEGACY_FULL = `---
name: i18n-copy
description: Draft or review labels of one locale.
inputs: [locale, namespace]
outputs: [messages patch]
---

# Procedure
Translate {namespace} for {locale}.`;

const METADATA_FULL = `---
name: i18n-copy
description: Draft or review labels of one locale.
metadata:
  inputs: [locale, namespace]
  outputs: [messages patch]
---

# Procedure
Translate {namespace} for {locale}.`;

const FULL = METADATA_FULL;

describe("parseSkill — metadata (recommended shape)", () => {
    it("extracts frontmatter, metadata lists, and body", () => {
        expect(parseSkill(FULL)).toEqual({
            name: "i18n-copy",
            description: "Draft or review labels of one locale.",
            inputs: ["locale", "namespace"],
            outputs: ["messages patch"],
            model: "openrouter/free",
            temperature: 0.3,
            maxTokens: 2000,
            timeoutMs: 25000,
            procedure: "# Procedure\nTranslate {namespace} for {locale}.",
        });
    });

    it("parses block lists under metadata", () => {
        expect(
            parseSkill("---\nname: n\ndescription: d\nmetadata:\n  inputs:\n    - a\n    - b\n---\nb").inputs,
        ).toEqual(["a", "b"]);
    });

    it("parses inline empty list under metadata", () => {
        expect(parseSkill("---\nname: n\ndescription: d\nmetadata:\n  inputs: []\n---\nb").inputs).toEqual([]);
    });

    it("reads execution params under metadata", () => {
        expect(
            parseSkill(
                "---\nname: n\ndescription: d\nmetadata:\n  model: x/y\n  temperature: 0.9\n  maxTokens: 100\n  timeoutMs: 1000\n---\nb",
            ),
        ).toMatchObject({
            model: "x/y",
            temperature: 0.9,
            maxTokens: 100,
            timeoutMs: 1000,
        });
    });

    it("lets metadata win over legacy top-level fields", () => {
        const skill = parseSkill(
            "---\nname: n\ndescription: d\ninputs: [legacy]\noutputs: [legacy out]\nmodel: legacy/model\ntemperature: 0.1\nmaxTokens: 10\ntimeoutMs: 100\nmetadata:\n  inputs: [modern]\n  outputs: [modern out]\n  model: modern/model\n  temperature: 0.9\n  maxTokens: 90\n  timeoutMs: 900\n---\nb",
        );

        expect(skill.inputs).toEqual(["modern"]);
        expect(skill.outputs).toEqual(["modern out"]);
        expect(skill.model).toBe("modern/model");
        expect(skill.temperature).toBe(0.9);
        expect(skill.maxTokens).toBe(90);
        expect(skill.timeoutMs).toBe(900);
    });

    it("stops metadata block on the next top-level key", () => {
        const skill = parseSkill("---\nname: n\ndescription: d\nmetadata:\n  inputs: [a]\nmodel: x/y\n---\nb");

        expect(skill.inputs).toEqual(["a"]);
        expect(skill.model).toBe("x/y");
    });

    it("ignores blank lines inside metadata", () => {
        expect(parseSkill("---\nname: n\ndescription: d\nmetadata:\n\n  inputs: [a]\n---\nb").inputs).toEqual(["a"]);
    });

    it("does not enter metadata when metadata has an inline value", () => {
        expect(parseSkill("---\nname: n\ndescription: d\nmetadata: notempty\ninputs: [a]\n---\nb").inputs).toEqual([
            "a",
        ]);
    });
});

describe("parseSkill — legacy fallback", () => {
    it("reads top-level inputs/outputs when metadata is absent", () => {
        const skill = parseSkill(LEGACY_FULL);

        expect(skill.inputs).toEqual(["locale", "namespace"]);
        expect(skill.outputs).toEqual(["messages patch"]);
    });

    it("parses top-level block lists", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs:\n  - a\n  - b\n---\nb").inputs).toEqual(["a", "b"]);
    });

    it("parses top-level inline empty list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs: []\n---\nb").inputs).toEqual([]);
    });

    it("defaults missing inputs/outputs to empty arrays", () => {
        const skill = parseSkill("---\nname: n\ndescription: d\n---\nb");

        expect(skill.inputs).toEqual([]);
        expect(skill.outputs).toEqual([]);
    });

    it("overrides default scalars with top-level values", () => {
        expect(
            parseSkill(
                "---\nname: n\ndescription: d\nmodel: x/y\ntemperature: 0.9\nmaxTokens: 100\ntimeoutMs: 1000\n---\nb",
            ),
        ).toMatchObject({
            model: "x/y",
            temperature: 0.9,
            maxTokens: 100,
            timeoutMs: 1000,
        });
    });
});

describe("parseSkill — list parsing boundaries", () => {
    it("treats an unclosed bracket as a plain scalar list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs: [a\n---\nb").inputs).toEqual(["[a"]);
    });

    it("filters empty elements from an inline list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs: [a, , b]\n---\nb").inputs).toEqual(["a", "b"]);
    });

    it("treats a plain scalar as a one-item list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs: a\n---\nb").inputs).toEqual(["a"]);
    });

    it("reuses the existing array when an empty key is duplicated", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs:\ninputs:\n  - a\n---\nb").inputs).toEqual(["a"]);
    });

    it("lets a scalar win over a duplicated block list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs:\n  - ignored\ninputs: [kept]\n---\nb").inputs).toEqual(
            ["kept"],
        );
    });

    it("ignores an orphan dash outside a list", () => {
        const skill = parseSkill("---\nname: n\ndescription: d\n- orphan\n---\nb");

        expect(skill.inputs).toEqual([]);
        expect(skill.outputs).toEqual([]);
    });

    it("ignores empty items in a block list", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ninputs:\n  - a\n  - \n  - b\n---\nb").inputs).toEqual([
            "a",
            "b",
        ]);
    });

    it("ignores indented keys outside metadata", () => {
        expect(parseSkill("---\nname: n\ndescription: d\n  inputs: [ignored]\n---\nb").inputs).toEqual([]);
    });

    it("ignores garbage lines", () => {
        expect(parseSkill("---\nname: n\ndescription: d\ngarbage\n---\nb").temperature).toBe(0.3);
    });
});

describe("parseSkill — authoring errors", () => {
    it("rejects missing frontmatter head", () => {
        expect(() => parseSkill("name: n")).toThrow(/frontmatter/);
    });

    it("rejects missing frontmatter tail", () => {
        expect(() => parseSkill("---\nname: n\ndescription: d")).toThrow(/frontmatter/);
    });

    it("rejects missing name", () => {
        expect(() => parseSkill("---\ndescription: d\n---\nb")).toThrow(/name field required/);
    });

    it("rejects missing description", () => {
        expect(() => parseSkill("---\nname: n\n---\nb")).toThrow(/description field required/);
    });

    it("rejects non-finite top-level temperature", () => {
        expect(() => parseSkill("---\nname: n\ndescription: d\ntemperature: abc\n---\nb")).toThrow(/temperature/);
    });

    it("rejects non-finite metadata temperature", () => {
        expect(() => parseSkill("---\nname: n\ndescription: d\nmetadata:\n  temperature: abc\n---\nb")).toThrow(
            /temperature/,
        );
    });

    it("rejects non-finite top-level maxTokens", () => {
        expect(() => parseSkill("---\nname: n\ndescription: d\nmaxTokens: abc\n---\nb")).toThrow(/maxTokens/);
    });

    it("rejects non-finite metadata timeoutMs", () => {
        expect(() => parseSkill("---\nname: n\ndescription: d\nmetadata:\n  timeoutMs: abc\n---\nb")).toThrow(
            /timeoutMs/,
        );
    });
});

describe("parseSkill — transport and body edge cases", () => {
    it("tolerates CRLF and BOM", () => {
        expect(parseSkill("\uFEFF" + FULL.replace(/\n/g, "\r\n")).name).toBe("i18n-copy");
    });

    it("returns an empty procedure when the body is empty", () => {
        expect(parseSkill("---\nname: n\ndescription: d\n---\n").procedure).toBe("");
    });
});

describe("serializeSkillResources", () => {
    it("returns an empty string for an empty list", () => {
        expect(serializeSkillResources([])).toBe("");
    });

    it("sorts by relPath using binary comparison and wraps each block", () => {
        const resources: SkillResource[] = [
            { relPath: "b/tool.json", content: "  {}  " },
            { relPath: "a.md", content: "alpha" },
        ];

        expect(serializeSkillResources(resources)).toBe("### Resource: a.md\nalpha\n\n### Resource: b/tool.json\n{}\n");
    });

    it("covers the equality branch of the comparator for identical relPaths", () => {
        const resources: SkillResource[] = [
            { relPath: "a.md", content: "1" },
            { relPath: "a.md", content: "2" },
        ];

        expect(serializeSkillResources(resources)).toBe("### Resource: a.md\n1\n\n### Resource: a.md\n2\n");
    });
});

describe("validateSkillInputs", () => {
    const skill = parseSkill(FULL);

    it("returns the cleaned object when all required inputs are present", () => {
        expect(validateSkillInputs(skill, { locale: " fr ", namespace: " nav " })).toEqual({
            locale: "fr",
            namespace: "nav",
        });
    });

    it("passes through undeclared string keys", () => {
        expect(
            validateSkillInputs(skill, {
                locale: "fr",
                namespace: "nav",
                extra: "keep",
            }),
        ).toEqual({
            locale: "fr",
            namespace: "nav",
            extra: "keep",
        });
    });

    it("drops non-string values in pass-through keys", () => {
        expect(validateSkillInputs(skill, { locale: "fr", namespace: "nav", n: 5 })).toEqual({
            locale: "fr",
            namespace: "nav",
        });
    });

    it("throws when a required input is missing", () => {
        expect(() => validateSkillInputs(skill, { locale: "fr" })).toThrow(/namespace/);
    });

    it("throws when a required input is empty after trim", () => {
        expect(() => validateSkillInputs(skill, { locale: "   ", namespace: "nav" })).toThrow(/locale/);
    });

    it("trims values to 10000 characters", () => {
        const result = validateSkillInputs(skill, {
            locale: "x ".repeat(20000),
            namespace: "nav",
        });

        expect(result.locale.length).toBe(10000);
    });
});

describe("assertCapabilityId — anti-traversal guard", () => {
    it.each(["hello", "i18n-copy", "a", "0", "a".repeat(64)])("accepts the slug %j", (id) => {
        expect(assertCapabilityId(id)).toBe(id);
    });

    it.each(["", "../secret", "..", "a/b", "a\b", "hello.md", "Hello", "-hello", "a b", "a".repeat(65)])(
        "rejects %j",
        (id) => {
            expect(() => assertCapabilityId(id)).toThrow(/Invalid capability id/);
        },
    );
});
