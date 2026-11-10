export interface AgentDef {
    id: string;
    name: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
    systemPrompt: string;
}
// Frontmatter contract (docs/ai-capabilities.md): leading + closing `---` required; `key: value`
// pairs (colon + space, otherwise the line is ignored); `id` required; FINITE numbers (NaN/
// Infinity = author error, never a silent default); BOM/CRLF tolerated.
// NB: the `input` field NO LONGER exists — in the unified model the prompt is always the
// user message and always required (composeRun), so an "expects/does not expect a prompt" guard
// was dead and contradictory. See docs/ai-capabilities.md.
const DEFAULTS = {
    model: "openrouter/free",
    temperature: 0.7,
    maxTokens: 300,
    timeoutMs: 25000,
} as const;

function finiteOrThrow(raw: string | undefined, field: string, fallback: number): number {
    if (raw === undefined) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
        throw new Error(`Agent invalide : champ "${field}" non numérique (${JSON.stringify(raw)}).`);
    }
    return n;
}

export function parseAgent(raw: string): AgentDef {
    const cleaned = raw.replace(/^﻿/, "").trim();
    const m = cleaned.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) throw new Error("Agent invalide : frontmatter manquant (--- de tête et de queue requis).");

    const meta: Record<string, string> = {};
    for (const line of m[1].split(/\r?\n/)) {
        const idx = line.indexOf(": ");
        if (idx === -1) continue;
        meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    const id = meta.id;
    if (!id) throw new Error("Agent invalide : champ id requis.");

    return {
        id,
        name: meta.name ?? id,
        model: meta.model ?? DEFAULTS.model,
        temperature: finiteOrThrow(meta.temperature, "temperature", DEFAULTS.temperature),
        maxTokens: finiteOrThrow(meta.maxTokens, "maxTokens", DEFAULTS.maxTokens),
        timeoutMs: finiteOrThrow(meta.timeoutMs, "timeoutMs", DEFAULTS.timeoutMs),
        systemPrompt: m[2].trim(),
    };
}

export function renderPrompt(template: string, vars: Record<string, string>): string {
    return template.replace(/{(\w+)}/g, (_, k) => vars[k] ?? "");
}
