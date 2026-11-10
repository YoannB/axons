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

describe("openrouterClient — missing key branch", () => {
    it("throws an explicit error when OPENROUTER_API_KEY is missing", async () => {
        const provider = await loadProvider();

        expect(() => provider.openrouterClient()).toThrow("OPENROUTER_API_KEY is missing.");
        expect(createOpenRouter).not.toHaveBeenCalled();
    });
});

describe("openrouterClient — cache branch cached ??=", () => {
    it("creates the client only once then reuses the cached instance", async () => {
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

describe("resolveModel — delegation to the OpenRouter client", () => {
    it("calls the OpenRouter client with the model id", async () => {
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
