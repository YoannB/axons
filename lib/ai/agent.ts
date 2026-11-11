import { generateText, type ModelMessage } from "ai";
import { readFileSync } from "node:fs";
import path from "node:path";
import "server-only";
import { composeRun, type ComposedRun } from "./compose";
import { AiError } from "./errors";
import { parseAgent, type AgentDef } from "./parse-agent";
import { resolveModel } from "./provider";
import { loadSkill } from "./skill-io";
import { assertCapabilityId, validateSkillInputs } from "./skill-pure";

const agentCache = new Map<string, AgentDef>();

function loadAgent(id: string): AgentDef {
    assertCapabilityId(id);

    const cached = agentCache.get(id);
    if (cached) return cached;

    const file = path.join(process.cwd(), "capabilities", "agents", `${id}.md`);
    const def = parseAgent(readFileSync(file, "utf8"));

    agentCache.set(id, def);
    return def;
}

// DEFENSIVE CLEANUP ("User Safety: safe"): prefix injected by the provider behind
// the openrouter/free alias, absent from our files. Regex anchored at the start, applied once.
const SAFETY_PREFIX = /^\s*User\s+Safety\s*:\s*[A-Za-z]+\s*[:.-]?\s*/i;

function stripSafetyPrefix(text: string, logTag: string): string {
    if (!SAFETY_PREFIX.test(text)) return text;

    const stripped = text.replace(SAFETY_PREFIX, "").trim();

    console.warn(`[ai:${logTag}] safety prefix stripped, len=${text.length}->${stripped.length}`);

    return stripped;
}

// Short reasoning, not returned. "Reasoning" models (common behind
// openrouter/free) count their hidden tokens against maxOutputTokens: unbounded, they can
// consume everything and end with finishReason=length and an EMPTY text (observed in production).
// Models without reasoning ignore the option.
const REASONING = { reasoning: { effort: "low", exclude: true } } as const;

export interface RunPromptInput extends ComposedRun {
    request: Request;
    logTag: string;
}

// NETWORK core only: timeout+signal, generateText(messages), safety strip, truncation
// guard ('length' only), network error normalization. Does NEITHER fs NOR
// composition (that is run/composeRun) => capability errors never land here.
export async function runPrompt({
    model,
    temperature,
    maxTokens,
    timeoutMs,
    messages,
    request,
    logTag,
}: RunPromptInput): Promise<{ text: string }> {
    const timeout = AbortSignal.timeout(timeoutMs);

    const anySignal = (
        AbortSignal as unknown as {
            any?: (signals: AbortSignal[]) => AbortSignal;
        }
    ).any;

    const signal = anySignal ? anySignal([timeout, request.signal]) : timeout;

    const instructions = messages
        .filter((message) => message.role === "system")
        .map((message) => message.content)
        .join("\n\n")
        .trim();

    const modelMessages: ModelMessage[] = messages
        .filter((message) => message.role === "user")
        .map((message) => ({
            role: "user" as const,
            content: message.content,
        }));

    try {
        const result = await generateText({
            model: resolveModel(model),
            ...(instructions ? { instructions } : {}),
            messages: modelMessages,
            temperature,
            maxOutputTokens: maxTokens,
            abortSignal: signal,
            providerOptions: { openrouter: REASONING },
        });

        const cleaned = stripSafetyPrefix((result.text ?? "").trim(), logTag);

        if (result.finishReason === "length") {
            console.warn(
                `[ai:${logTag}] finishReason=length (truncation) len=${cleaned.length} excerpt=${cleaned.slice(0, 160)}`,
            );
            throw new AiError("generic", undefined, 502);
        }

        return { text: cleaned };
    } catch (e) {
        if (e instanceof AiError) throw e;

        const err = e as Error & { name?: string };

        if (err.name === "TimeoutError" || /timeout/i.test(err.message ?? ""))
            throw new AiError("timeout", undefined, 504);

        // Provider 429 (common on openrouter/free): transient, NOT our daily quota.
        if (/quota|429|rate/i.test(err.message ?? "")) throw new AiError("busy", undefined, 429);

        console.error(`[ai:${logTag}] OpenRouter failure`, err);
        throw new AiError("provider", undefined, 502);
    }
}

export interface RunInput {
    prompt: string; // user message, ALWAYS required (composeRun enforces it)
    agentId?: string; // optional profile (system + execution params)
    skillId?: string; // optional method (procedure + resources)
    inputs?: Record<string, string>; // substitution vars for the system prompt (locale injected by the route)
    includeResources?: string[]; // subset of skill relPaths to send (all of them otherwise)
    request: Request;
    logTag: string;
}

// SINGLE orchestrator: load (fs) -> validate -> compose (pure) -> network. Any
// load/validation/composition error (malformed/missing capability, empty prompt) = invalid
// request (400), mapped HERE before the network; runPrompt only sees model failures.
export async function run(input: RunInput): Promise<{ text: string }> {
    let composed: ComposedRun;

    try {
        const agent = input.agentId ? loadAgent(input.agentId) : undefined;
        const skill = input.skillId ? loadSkill(input.skillId) : undefined;
        const rawInputs = input.inputs ?? {};
        const inputs = skill ? validateSkillInputs(skill, rawInputs) : rawInputs;

        composed = composeRun({
            prompt: input.prompt,
            agent,
            skill,
            inputs,
            includeResources: input.includeResources,
        });
    } catch (e) {
        throw new AiError("invalid", e instanceof Error ? e.message : undefined, 400);
    }

    return runPrompt({
        ...composed,
        request: input.request,
        logTag: input.logTag,
    });
}
