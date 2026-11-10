// PURE module (no next-intl import): list of served locales and resolution of the default
// locale. Kept apart from routing.ts so it stays testable by Vitest without mocks.

// Served locales. Single-language site: keep only one (the NEXT_PUBLIC_DEFAULT_LOCALE one).
export const LOCALES = ["fr", "en", "es", "de", "it", "pt"] as const;
export type AppLocale = (typeof LOCALES)[number];

// Default locale = NEXT_PUBLIC_DEFAULT_LOCALE (inlined at build time, so literal access to
// process.env is mandatory on the client). Empty/missing => "en". Outside LOCALES => explicit
// error at build time rather than a silent fallback that would serve the wrong language.
export function resolveDefaultLocale(raw: string | undefined, locales: readonly string[] = LOCALES): AppLocale {
    const value = raw?.trim() || "en";

    if (!locales.includes(value)) {
        throw new Error(
            `NEXT_PUBLIC_DEFAULT_LOCALE invalide : ${JSON.stringify(value)} n'est pas dans [${locales.join(", ")}].`,
        );
    }

    return value as AppLocale;
}
