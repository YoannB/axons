import { routing } from "@/i18n/routing";
import { run } from "@/lib/ai/agent";
import { AiError, clientErrorPayload, statusFor } from "@/lib/ai/errors";
import { quotaDeniedResponse, refundQuota, reserveQuota } from "@/lib/ai/quota";
import { clientIpFrom, hitRateLimit } from "@/lib/ai/rate-limit";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
// LEGACY ADAPTER. /api/hello remains the endpoint of the showcase "Test the AI" button and of the
// E2E mock (**/api/hello): it breaks nothing client-side, it delegates to the unified run() core
// with the 'hello' agent and a FIXED prompt. The `input` field of the historical body is no longer
// consumed (consistent with the removal of agent.input; hello.md had no {input}, the
// textarea was already ignored). To compose prompt+agent+skill, call /api/run.
// Same server quota as /api/run (shared counter, like the client quota).
const HELLO_PROMPT = "Greet the visitor.";
export async function POST(request: Request) {
    const ip = clientIpFrom(request.headers);
    if (!hitRateLimit(ip)) {
        return NextResponse.json(clientErrorPayload(new AiError("busy", undefined, 429)), {
            status: 429,
        });
    }
    let body: Record<string, unknown> = {};
    try {
        body = (await request.json()) as Record<string, unknown>;
    } catch {
        body = {};
    }
    const reqLocale = typeof body.locale === "string" ? body.locale : undefined;
    const locale =
        reqLocale && (routing.locales as readonly string[]).includes(reqLocale) ? reqLocale : routing.defaultLocale;
    const gate = await reserveQuota(ip);
    if (!gate.ok) return quotaDeniedResponse(gate);
    try {
        const { text } = await run({
            prompt: HELLO_PROMPT,
            agentId: "hello",
            inputs: { locale },
            request,
            logTag: "hello",
        });
        if (!text.trim()) await refundQuota(gate.ticket);
        return NextResponse.json({ text });
    } catch (e) {
        await refundQuota(gate.ticket);
        return NextResponse.json(clientErrorPayload(e), { status: statusFor(e) });
    }
}
