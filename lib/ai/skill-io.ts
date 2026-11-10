// Filesystem loading of skills. IO module, deliberately separate from skill-pure.ts.
// As per docs/testing.md, this module is NOT covered by mocked unit tests:
// it belongs to E2E / integration.
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import "server-only";
import { parseSkill } from "./parse-skill";
import { assertCapabilityId, type LoadedSkill, type SkillResource } from "./skill-pure";

const skillCache = new Map<string, LoadedSkill>();

function skillDir(id: string): string {
    return path.join(process.cwd(), "capabilities", "skills", id);
}

// DETERMINISTIC recursive walk of the skill folder, manifest excluded.
// Reads files only; relPath relative to the folder, separators normalized to "/".
function collectResources(dir: string, base: string): SkillResource[] {
    const out: SkillResource[] = [];

    for (const entry of readdirSync(dir)) {
        const abs = path.join(dir, entry);
        const rel = path.relative(base, abs).split(path.sep).join("/");

        if (rel === "SKILL.md") continue;

        if (statSync(abs).isDirectory()) {
            out.push(...collectResources(abs, base));
            continue;
        }

        out.push({ relPath: rel, content: readFileSync(abs, "utf8") });
    }

    return out;
}

export function loadSkill(id: string): LoadedSkill {
    assertCapabilityId(id);

    const cached = skillCache.get(id);
    if (cached) return cached;

    const dir = skillDir(id);
    const def = parseSkill(readFileSync(path.join(dir, "SKILL.md"), "utf8"));

    const loaded: LoadedSkill = {
        id,
        ...def,
        resources: collectResources(dir, dir),
    };

    skillCache.set(id, loaded);
    return loaded;
}
