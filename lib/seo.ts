import { SITE_URL } from "@/constants/site";
import { getPathname, routing } from "@/i18n/routing";
import type { Metadata } from "next";

type LogicalHref = "/" | "/sitemap" | "/legal" | "/privacy" | "/cookies";

// Localized metadata + hreflang, reused by every page.
// href = LOGICAL KEY of the pathnames mapping (never a concatenated localized slug).
export function pageMetadata(opts: { title: string; description: string; href: LogicalHref }): Metadata {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
        languages[locale] = new URL(getPathname({ locale, href: opts.href }), SITE_URL).toString();
    }
    languages["x-default"] = new URL(
        getPathname({ locale: routing.defaultLocale, href: opts.href }),
        SITE_URL,
    ).toString();

    const canonical = languages[routing.defaultLocale];
    return {
        title: opts.title,
        description: opts.description,
        alternates: { canonical, languages },
        openGraph: {
            title: opts.title,
            description: opts.description,
            url: canonical,
            type: "website",
            locale: routing.defaultLocale,
        },
    };
}
