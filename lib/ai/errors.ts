export type AiErrorCode = "rate" | "busy" | "timeout" | "provider" | "invalid" | "generic" | "nokey";
export class AiError extends Error {
    constructor(
        public code: AiErrorCode,
        message?: string,
        public status = 500,
    ) {
        super(message ?? code);
        this.name = "AiError";
    }
}
export function clientErrorPayload(e: unknown): {
    error: { code: AiErrorCode; message: string };
} {
    if (e instanceof AiError) return { error: { code: e.code, message: publicMessage(e.code) } };
    return { error: { code: "generic", message: publicMessage("generic") } };
}
export function statusFor(e: unknown): number {
    if (e instanceof AiError) return e.status;
    return 500;
}
// Technical message NEVER returned raw to the user (no key, no prompt, no provider response).
function publicMessage(code: AiErrorCode): string {
    switch (code) {
        case "rate":
            return "quota";
        case "busy":
            return "busy";
        case "timeout":
            return "timeout";
        case "provider":
            return "provider";
        case "invalid":
            return "invalid";
        case "nokey":
            return "not configured";
        default:
            return "failed";
    }
}
