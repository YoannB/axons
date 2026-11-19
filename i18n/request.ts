import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

function escapeIcuText(value: string): string {
    // Escapes ICU/MessageFormat special characters: ' { } #
    return value.replace(/['#{}]/g, (match) => (match === "'" ? "''" : `'${match}'`));
}

function envValue(key: string): string {
    return process.env[key]?.trim() ?? "";
}

function formatDeclaredDate(locale: string): string {
    const raw = envValue("LEGAL_ACTIVITY_DECLARED_DATE");

    if (!raw) {
        return "";
    }

    const date = new Date(raw);

    if (Number.isNaN(date.getTime())) {
        return raw;
    }

    try {
        return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
    } catch {
        return raw;
    }
}

function legalVariables(locale: string): Record<string, string> {
    const editorName = envValue("LEGAL_EDITOR_NAME");
    const publicationDirector = envValue("LEGAL_PUBLICATION_DIRECTOR") || editorName;

    return {
        editorName: escapeIcuText(editorName),
        tradeName: escapeIcuText(envValue("LEGAL_EDITOR_TRADE_NAME")),
        siren: escapeIcuText(envValue("LEGAL_EDITOR_SIREN")),
        apeCode: escapeIcuText(envValue("LEGAL_EDITOR_APE_CODE")),
        address: escapeIcuText(envValue("LEGAL_EDITOR_ADDRESS")),
        publicationDirector: escapeIcuText(publicationDirector),
        contactEmail: escapeIcuText(envValue("LEGAL_CONTACT_EMAIL")),
        declaredDate: escapeIcuText(formatDeclaredDate(locale)),
    };
}

function interpolate(value: unknown, vars: Record<string, string>): unknown {
    if (typeof value === "string") {
        let output = value;

        for (const [key, replacement] of Object.entries(vars)) {
            const token = `{${key}}`;

            if (output.includes(token)) {
                output = output.split(token).join(replacement);
            }
        }

        return output;
    }

    if (Array.isArray(value)) {
        return value.map((item) => interpolate(item, vars));
    }

    if (value && typeof value === "object") {
        const result: Record<string, unknown> = {};

        for (const [key, item] of Object.entries(value)) {
            result[key] = interpolate(item, vars);
        }

        return result;
    }

    return value;
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;

    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const rawMessages = (await import(`../messages/${locale}.json`)).default;

    const messages = interpolate(rawMessages, legalVariables(locale)) as typeof rawMessages;

    return {
        locale,
        messages,
        timeZone: "Europe/Paris",
    };
});
