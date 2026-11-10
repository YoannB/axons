// @vitest-environment node
import { AiError, clientErrorPayload, statusFor, type AiErrorCode } from "@/lib/ai/errors";
import { describe, expect, it } from "vitest";

describe("AiError", () => {
    it("conserve code, status et message technique", () => {
        const error = new AiError("provider", "raw provider failure", 502);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("AiError");
        expect(error.code).toBe("provider");
        expect(error.status).toBe(502);
        expect(error.message).toBe("raw provider failure");
    });

    it("utilise le code comme message par défaut", () => {
        const error = new AiError("timeout");

        expect(error.message).toBe("timeout");
        expect(error.status).toBe(500);
    });

    it("permet un status personnalisé", () => {
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

    it.each(cases)("cartographie %s vers le message public %s", (code, publicMessage) => {
        const payload = clientErrorPayload(new AiError(code, "technical detail"));

        expect(payload).toEqual({
            error: {
                code,
                message: publicMessage,
            },
        });
    });

    it("ne fuit jamais le message technique brut", () => {
        const payload = clientErrorPayload(
            new AiError("provider", "OPENROUTER_API_KEY missing upstream prompt leaked", 502),
        );

        expect(payload.error.message).toBe("provider");
        expect(payload.error.message).not.toContain("OPENROUTER");
        expect(payload.error.message).not.toContain("prompt");
    });

    it("couvre la branche default de publicMessage pour un code inconnu", () => {
        const payload = clientErrorPayload(new AiError("unknown-code" as AiErrorCode, undefined, 500));

        expect(payload).toEqual({
            error: {
                code: "unknown-code",
                message: "failed",
            },
        });
    });
});

describe("clientErrorPayload — erreur inconnue", () => {
    it("normalise une Error classique en generic/failed", () => {
        const payload = clientErrorPayload(new Error("boom"));

        expect(payload).toEqual({
            error: {
                code: "generic",
                message: "failed",
            },
        });
    });

    it("normalise une valeur non-Error en generic/failed", () => {
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
    it("retourne le status porté par AiError", () => {
        expect(statusFor(new AiError("invalid", undefined, 400))).toBe(400);
        expect(statusFor(new AiError("rate", undefined, 429))).toBe(429);
        expect(statusFor(new AiError("timeout", undefined, 504))).toBe(504);
        expect(statusFor(new AiError("provider", undefined, 502))).toBe(502);
    });

    it("retourne 500 pour une erreur inconnue", () => {
        expect(statusFor(new Error("boom"))).toBe(500);
        expect(statusFor(null)).toBe(500);
        expect(statusFor(undefined)).toBe(500);
        expect(statusFor("nope")).toBe(500);
    });
});
