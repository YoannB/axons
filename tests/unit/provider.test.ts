// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const createOpenRouter = vi.hoisted(() => vi.fn());
const SERVER_ENV = vi.hoisted(() => ({
    openrouterApiKey: "",
}));

vi.mock("server-only", () => ({}));

vi.mock("@openrouter/ai-sdk-provider", () => ({
    createOpenRouter,
}));

vi.mock("@/lib/env-server", () => ({
    SERVER_ENV,
}));

async function loadProvider() {
    vi.resetModules();
    createOpenRouter.mockReset();
    SERVER_ENV.openrouterApiKey = "";

    return await import("@/lib/ai/provider");
}

describe("openrouterClient — branche clé manquante", () => {
    it("lève une erreur explicite si OPENROUTER_API_KEY est absente", async () => {
        const provider = await loadProvider();

        expect(() => provider.openrouterClient()).toThrow("OPENROUTER_API_KEY manquante.");
        expect(createOpenRouter).not.toHaveBeenCalled();
    });
});

describe("openrouterClient — branche de cache cached ??=", () => {
    it("crée le client une seule fois puis réutilise l'instance câchée", async () => {
        const provider = await loadProvider();
        SERVER_ENV.openrouterApiKey = "sk-or-test";

        const client = vi.fn(() => "model");
        createOpenRouter.mockReturnValue(client);

        const first = provider.openrouterClient() as unknown as typeof client;
        const second = provider.openrouterClient() as unknown as typeof client;

        expect(first).toBe(client);
        expect(second).toBe(client);
        expect(createOpenRouter).toHaveBeenCalledTimes(1);
        expect(createOpenRouter).toHaveBeenCalledWith({
            apiKey: "sk-or-test",
        });
    });
});

describe("resolveModel — délégation au client OpenRouter", () => {
    it("appelle le client OpenRouter avec l'identifiant du modèle", async () => {
        const provider = await loadProvider();
        SERVER_ENV.openrouterApiKey = "sk-or-test";

        const model = { id: "openrouter/free" };
        const client = vi.fn(() => model);
        createOpenRouter.mockReturnValue(client);

        const result = provider.resolveModel("openrouter/free") as unknown as typeof model;

        expect(result).toBe(model);
        expect(client).toHaveBeenCalledWith("openrouter/free");
        expect(createOpenRouter).toHaveBeenCalledTimes(1);
    });
});
