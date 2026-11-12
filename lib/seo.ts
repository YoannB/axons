import { SITE_URL } from "@/constants/site";
import { getPathname, routing } from "@/i18n/routing";
import type { ArticleEntry } from "@/lib/articles/parse";
import type { CollectionSchemaType, StaticHref } from "@/lib/site-extension";
import type { Metadata } from "next";

// Logical key of a STATIC route (Axons + site pathnames, i18n/routing.ts); dynamic `[param]` routes excluded.
export type LogicalHref = StaticHref<typeof routing.pathnames>;

const absolute = (pathname: string) => new URL(pathname, SITE_URL).toString();

// Logical key of a collection ENTRY route ("/articles/[slug]", a site's "/reminders/[slug]"…).
export type EntryHref = Extract<keyof typeof routing.pathnames, `${string}/[slug]`>;

// Localized path of an entry translation of a collection (its slug differs per locale).
export function entryPath(itemHref: EntryHref, locale: string, slug: string): string {
    // The union of entry keys is narrowed to one key for the typed overloads of getPathname.
    return getPathname({ locale, href: { pathname: itemHref as "/articles/[slug]", params: { slug } } });
}

// Localized path of an article translation (Axons' default collection).
export function articlePath(locale: string, slug: string): string {
    return entryPath("/articles/[slug]", locale, slug);
}

// Shared core: `urls` = absolute URL of the SAME resource in every locale where it exists.
// canonical = the page's OWN locale URL (a translation is not a duplicate of the default
// locale); x-default = the default-locale version, else the page itself.
function localizedMetadata(opts: {
    title: string;
    description: string;
    locale: string;
    urls: Record<string, string>;
}): Metadata & { alternates: { canonical: string; languages: Record<string, string> } } {
    const canonical = opts.urls[opts.locale];
    const languages = { ...opts.urls, "x-default": opts.urls[routing.defaultLocale] ?? canonical };
    return {
        title: opts.title,
        description: opts.description,
        alternates: { canonical, languages },
        openGraph: {
            title: opts.title,
            description: opts.description,
            url: canonical,
            type: "website",
            locale: opts.locale,
        },
    };
}

// Localized metadata + hreflang, reused by every static page.
// href = LOGICAL KEY of the pathnames mapping (never a concatenated localized slug).
export function pageMetadata(opts: {
    title: string;
    description: string;
    href: LogicalHref;
    locale: string;
}): Metadata {
    const urls: Record<string, string> = {};
    for (const locale of routing.locales) urls[locale] = absolute(getPathname({ locale, href: opts.href }));
    return localizedMetadata({ ...opts, urls });
}

// Article (collection entry) metadata: hreflang lists ONLY the locales that really have a translation.
export function articleMetadata(
    entry: ArticleEntry,
    locale: string,
    itemHref: EntryHref = "/articles/[slug]",
): Metadata {
    const article = entry.translations[locale];
    const urls: Record<string, string> = {};
    for (const [l, translation] of Object.entries(entry.translations))
        urls[l] = absolute(entryPath(itemHref, l, translation.slug));
    const base = localizedMetadata({ title: article.title, description: article.description, locale, urls });
    return {
        ...base,
        openGraph: {
            ...base.openGraph,
            type: "article",
            publishedTime: article.date,
            ...(article.image ? { images: [{ url: absolute(article.image) }] } : {}),
        },
    };
}

// schema.org entry (BlogPosting for articles; a collection picks its type), serialized into a
// <script type="application/ld+json">.
export function articleJsonLd(
    entry: ArticleEntry,
    locale: string,
    siteName: string,
    {
        itemHref = "/articles/[slug]",
        schemaType = "BlogPosting",
    }: { itemHref?: EntryHref; schemaType?: CollectionSchemaType } = {},
): string {
    const article = entry.translations[locale];
    const url = absolute(entryPath(itemHref, locale, article.slug));
    const data = {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        inLanguage: locale,
        url,
        mainEntityOfPage: url,
        publisher: { "@type": "Organization", name: siteName },
        ...(article.image ? { image: absolute(article.image) } : {}),
    };
    // "<" escaped so that no content can close the script element.
    return JSON.stringify(data).replace(/</g, "\\u003c");
}
