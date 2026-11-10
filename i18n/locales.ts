// PURE module (no next-intl import): served locales and resolution of the default locale.
// Kept apart from routing.ts so it stays testable by Vitest without mocks.

// Every locale the boilerplate ships messages and localized pathnames for.
export const SUPPORTED_LOCALES = ["fr", "en", "es", "de", "it", "pt"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

// Served locales = NEXT_PUBLIC_LOCALES, a comma-separated SUBSET of SUPPORTED_LOCALES in display
// order (e.g. "fr,en" for a bilingual launch, "fr" for a single-language site). Empty/missing =>
// every supported locale. An unknown code throws at build time rather than being silently
// dropped (a typo would otherwise remove a language from the site without notice).
export function resolveLocales(
    raw: string | undefined,
    supported: readonly string[] = SUPPORTED_LOCALES,
): readonly AppLocale[] {
    const codes = (raw ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    if (codes.length === 0) return supported as readonly AppLocale[];
    const unknown = codes.filter((c) => !supported.includes(c));
    if (unknown.length > 0) {
        throw new Error(
            `NEXT_PUBLIC_LOCALES invalide : ${unknown.map((c) => JSON.stringify(c)).join(", ")} hors de [${supported.join(", ")}].`,
        );
    }
    return [...new Set(codes)] as AppLocale[];
}

// Literal process.env access: Next inlines NEXT_PUBLIC_* at build time (client bundle included).
export const LOCALES = resolveLocales(process.env.NEXT_PUBLIC_LOCALES);

// Default locale = NEXT_PUBLIC_DEFAULT_LOCALE. Empty/missing => "en" when served, otherwise the
// first served locale. Outside the served locales => explicit error at build time rather than a
// silent fallback that would serve the wrong language.
export function resolveDefaultLocale(raw: string | undefined, locales: readonly string[] = LOCALES): AppLocale {
    const value = raw?.trim() || (locales.includes("en") ? "en" : locales[0]);

    if (!locales.includes(value)) {
        throw new Error(
            `NEXT_PUBLIC_DEFAULT_LOCALE invalide : ${JSON.stringify(value)} n'est pas dans [${locales.join(", ")}].`,
        );
    }

    return value as AppLocale;
}
