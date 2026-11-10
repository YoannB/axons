import "server-only";
export const SERVER_ENV = {
    openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
    openrouterModel: process.env.OPENROUTER_MODEL ?? "openrouter/free",
} as const;
