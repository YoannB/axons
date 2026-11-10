// PURE skill logic: deterministic serialization and input validation.
// No node:fs, no server-only, no network dependency.
// This module must stay importable by Vitest and 100% branch-testable.
import type { SkillDef } from "./parse-skill";

export interface SkillResource {
    relPath: string;
    content: string;
}

export interface LoadedSkill extends SkillDef {
    id: string;
    resources: SkillResource[];
}

// Anti-traversal guard: agentId/skillId come from the request body and end up in
// a path.join towards capabilities/. Only a kebab-case slug is accepted (no "/", "\", "."),
// so leaving the folder is impossible. Error = plain Error (mapped to invalid 400 by run).
const CAPABILITY_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export function assertCapabilityId(id: string): string {
    if (!CAPABILITY_ID.test(id)) {
        throw new Error(`Identifiant de capacité invalide : ${JSON.stringify(id)}.`);
    }

    return id;
}

// DETERMINISTIC serialization: binary sort by relPath (not localeCompare, which depends
// on the runtime locale => not reproducible), each resource in a block tagged
// with its path.
export function serializeSkillResources(resources: SkillResource[]): string {
    if (resources.length === 0) return "";

    const sorted = [...resources].sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));

    return sorted.map((r) => `### Resource: ${r.relPath}\n${r.content.trim()}\n`).join("\n");
}

// Validation of the REQUIRED inputs declared by the skill, with PASS-THROUGH of
// undeclared keys (e.g. `locale` injected by the route, required by the AGENT but not by the
// skill): only what the skill declares is normalized (trim/slice), nothing else
// is dropped. Error = plain Error (mapped to invalid 400 by run).
export function validateSkillInputs(skill: SkillDef, raw: Record<string, unknown>): Record<string, string> {
    const clean: Record<string, string> = {};

    for (const [k, v] of Object.entries(raw)) {
        if (typeof v === "string") clean[k] = v.trim().slice(0, 10_000);
    }

    for (const key of skill.inputs) {
        if (!clean[key]) {
            throw new Error(`Skill invalide : entrée requise "${key}" manquante ou vide.`);
        }
    }

    return clean;
}
