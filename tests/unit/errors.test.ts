// @vitest-environment node
import { AiError, clientErrorPayload, statusFor, type AiErrorCode } from "@/lib/ai/errors";
import { describe, expect, it } from "vitest";

describe("AiError", () => {
    it("keeps code, status and technical message", () => {
        const error = new AiError("provider", "raw provider failure", 502);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AiError");
        expect(error.code).toBe("provider");
        expect(error.status).toBe(502);
        expect(error.message).toBe("raw provider failure");
    });

    it("uses the code as the default message", () => {
        const error = new AiError("timeout");

        expect(error.message).toBe("timeout");
        expect(error.status).toBe(500);
    });

    it("allows a custom status", () => {
        const error = new AiError("invalid", undefined, 400);

        expect(error.status).toBe(400);
    });
});

describe("clientErrorPayload — AiError", () => {
    const cases: Array<[AiErrorCode, string]> = [
        ["rate", "quota"],
        ["busy", "busy"],
        ["timeout", "timeout"],
        ["provider", "provider"],
        ["invalid", "invalid"],
        ["nokey", "not configured"],
        ["generic", "failed"],
    ];

    it.each(cases)("maps %s to the public message %s", (code, publicMessage) => {
        const payload = clientErrorPayload(new AiError(code, "technical detail"));

        expect(payload).toEqual({
            error: {
                code,
                message: publicMessage,
            },
        });
    });

    it("never leaks the raw technical message", () => {
        const payload = clientErrorPayload(
            new AiError("provider", "OPENROUTER_API_KEY missing upstream prompt leaked", 502),
        );

        expect(payload.error.message).toBe("provider");
        expect(payload.error.message).not.toContain("OPENROUTER");
        expect(payload.error.message).not.toContain("prompt");
    });

    it("covers the default branch of publicMessage for an unknown code", () => {
        const payload = clientErrorPayload(new AiError("unknown-code" as AiErrorCode, undefined, 500));

        expect(payload).toEqual({
            error: {
                code: "unknown-code",
                message: "failed",
            },
        });
    });
});

describe("clientErrorPayload — unknown error", () => {
    it("normalizes a plain Error to generic/failed", () => {
        const payload = clientErrorPayload(new Error("boom"));

        expect(payload).toEqual({
            error: {
                code: "generic",
                message: "failed",
            },
        });
    });

    it("normalizes a non-Error value to generic/failed", () => {
        const payload = clientErrorPayload("string failure");

        expect(payload).toEqual({
            error: {
                code: "generic",
                message: "failed",
            },
        });
    });
});

describe("statusFor", () => {
    it("returns the status carried by AiError", () => {
        expect(statusFor(new AiError("invalid", undefined, 400))).toBe(400);
        expect(statusFor(new AiError("rate", undefined, 429))).toBe(429);
        expect(statusFor(new AiError("timeout", undefined, 504))).toBe(504);
        expect(statusFor(new AiError("provider", undefined, 502))).toBe(502);
    });

    it("returns 500 for an unknown error", () => {
        expect(statusFor(new Error("boom"))).toBe(500);
        expect(statusFor(null)).toBe(500);
        expect(statusFor(undefined)).toBe(500);
        expect(statusFor("nope")).toBe(500);
    });
});
