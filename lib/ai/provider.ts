import { SERVER_ENV } from "@/lib/env-server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import "server-only";

let cached: ReturnType<typeof createOpenRouter> | null = null;
export function openrouterClient() {
    if (!SERVER_ENV.openrouterApiKey) throw new Error("OPENROUTER_API_KEY manquante.");
    cached ??= createOpenRouter({ apiKey: SERVER_ENV.openrouterApiKey });
    return cached;
}
export function resolveModel(id: string) {
    // id = OpenRouter identifier (e.g. 'openrouter/free'); checked in the catalog at deploy time.
    return openrouterClient()(id);
}
