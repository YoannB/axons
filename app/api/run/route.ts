import { routing } from "@/i18n/routing";
import { run } from "@/lib/ai/agent";
import { AiError, clientErrorPayload, statusFor } from "@/lib/ai/errors";
import { quotaDeniedResponse, refundQuota, reserveQuota } from "@/lib/ai/quota";
import { clientIpFrom, hitRateLimit } from "@/lib/ai/rate-limit";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
// UNIFIED AI route. Quota: hitRateLimit (memory, free) then reserveQuota (shared store)
// BEFORE the LLM; credit refunded (refundQuota) if run throws or the reply is empty.
// Body: { prompt (required), agentId?, skillId?, inputs?, includeResources? }.
// The route owns the HTTP concerns (rate limit, body parsing, locale resolution, merging the
// locale into inputs); composition and network live in lib/ai (run -> composeRun +
// runPrompt). Adding a capability = drop capabilities/agents/<id>.md or
// capabilities/skills/<id>/SKILL.md (+ resources), then call this route with the id.
export async function POST(request: Request) {
    const ip = clientIpFrom(request.headers);
    if (!hitRateLimit(ip)) {
        return NextResponse.json(clientErrorPayload(new AiError("busy", undefined, 429)), { status: 429 });
    }
    let body: Record<string, unknown> = {};
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        body = {};
    }

    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const agentId = typeof body.agentId === "string" ? body.agentId : undefined;
    const skillId = typeof body.skillId === "string" ? body.skillId : undefined;
    const includeResources = Array.isArray(body.includeResources)
        ? (body.includeResources as unknown[]).filter((x): x is string => typeof x === "string")
        : undefined;

    const rawInputs = body.inputs && typeof body.inputs === "object" ? (body.inputs as Record<string, unknown>) : {};
    const inputs: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawInputs)) if (typeof v === "string") inputs[k] = v;
    const reqLocale = typeof rawInputs.locale === "string" ? rawInputs.locale : undefined;
    inputs.locale =
        reqLocale && (routing.locales as readonly string[]).includes(reqLocale) ? reqLocale : routing.defaultLocale;

    const logTag = `run(${agentId ?? "-"}+${skillId ?? "-"})`;
    const gate = await reserveQuota(ip);
    if (!gate.ok) return quotaDeniedResponse(gate);
    try {
        const { text } = await run({
            prompt,
            agentId,
            skillId,
            inputs,
            includeResources,
            request,
            logTag,
        });
        if (!text.trim()) await refundQuota(gate.ticket);
        return NextResponse.json({ text });
    } catch (e) {
        await refundQuota(gate.ticket);
        return NextResponse.json(clientErrorPayload(e), { status: statusFor(e) });
    }
}
