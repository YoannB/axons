// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Article, ArticleEntry } from "@/lib/articles/parse";

const SITE_URL = vi.hoisted(() => "https://example.com");

const routing = vi.hoisted(() => ({
    locales: ["en", "fr"],
    defaultLocale: "en",
}));

type Href = string | { pathname: string; params: { slug: string } };

const getPathname = vi.hoisted(() => ({ locale, href }: { locale: string; href: Href }) => {
    const path = typeof href === "string" ? href : href.pathname.replace("[slug]", href.params.slug);
    if (locale === routing.defaultLocale) {
        return path;
    }

    return path === "/" ? `/${locale}` : `/${locale}${path}`;
});

vi.mock("@/constants/site", () => ({
    SITE_URL,
}));

vi.mock("@/i18n/routing", () => ({
    routing,
    getPathname,
}));

import { articleJsonLd, articleMetadata, articlePath, pageMetadata } from "@/lib/seo";

describe("pageMetadata — base metadata", () => {
    it("returns the given title and description", () => {
        const metadata = pageMetadata({ title: "Titre", description: "Description", href: "/", locale: "en" });

        expect(metadata.title).toBe("Titre");
        expect(metadata.description).toBe("Description");
    });
});

describe("pageMetadata — canonical", () => {
    it("points to the default locale URL on the default page", () => {
        const metadata = pageMetadata({ title: "Legal", description: "Legal page", href: "/legal", locale: "en" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/legal");
    });

    it("points to ITS locale URL on a translation (not to the default locale)", () => {
        const metadata = pageMetadata({ title: "Légal", description: "Mentions", href: "/legal", locale: "fr" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/fr/legal");
    });

    it("normalizes the root with a trailing slash", () => {
        const metadata = pageMetadata({ title: "Home", description: "Home page", href: "/", locale: "en" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/");
    });
});

describe("pageMetadata — hreflang", () => {
    it("adds one entry per configured locale", () => {
        const metadata = pageMetadata({
            title: "Privacy",
            description: "Privacy page",
            href: "/privacy",
            locale: "en",
        });

        expect(metadata.alternates?.languages).toMatchObject({
            en: "https://example.com/privacy",
            fr: "https://example.com/fr/privacy",
        });
    });

    it("adds x-default aligned with the default locale, whatever the page", () => {
        const metadata = pageMetadata({
            title: "Cookies",
            description: "Cookies page",
            href: "/cookies",
            locale: "fr",
        });

        expect(metadata.alternates?.languages?.["x-default"]).toBe("https://example.com/cookies");
    });

    it("does not produce a double slash on the localized root", () => {
        const metadata = pageMetadata({ title: "Home", description: "Home page", href: "/", locale: "en" });

        expect(metadata.alternates?.languages).toEqual({
            en: "https://example.com/",
            fr: "https://example.com/fr",
            "x-default": "https://example.com/",
        });
    });
});

describe("pageMetadata — OpenGraph", () => {
    it("duplicates the page's title, description, canonical URL, type and locale", () => {
        const metadata = pageMetadata({ title: "Plan", description: "Plan du site", href: "/sitemap", locale: "fr" });

        expect(metadata.openGraph).toEqual({
            title: "Plan",
            description: "Plan du site",
            url: "https://example.com/fr/sitemap",
            type: "website",
            locale: "fr",
        });
    });
});

const article = (locale: string, slug: string, extra: Partial<Article> = {}): Article => ({
    id: "demo",
    locale,
    slug,
    title: `Title ${locale}`,
    description: `Description ${locale}`,
    date: "2026-11-10",
    body: "Body",
    ...extra,
});

const BOTH: ArticleEntry = {
    id: "demo",
    translations: { en: article("en", "hello", { image: "/articles/demo/cover.png" }), fr: article("fr", "bonjour") },
};
const FR_ONLY: ArticleEntry = { id: "demo", translations: { fr: article("fr", "bonjour") } };

describe("articlePath", () => {
    it("builds the localized path with the translated slug", () => {
        expect(articlePath("fr", "bonjour")).toBe("/fr/articles/bonjour");
        expect(articlePath("en", "hello")).toBe("/articles/hello");
    });
});

describe("articleMetadata", () => {
    it("canonical = URL of the displayed translation, hreflang = existing translations", () => {
        const metadata = articleMetadata(BOTH, "fr");

        expect(metadata.alternates).toEqual({
            canonical: "https://example.com/fr/articles/bonjour",
            languages: {
                en: "https://example.com/articles/hello",
                fr: "https://example.com/fr/articles/bonjour",
                "x-default": "https://example.com/articles/hello",
            },
        });
        expect(metadata.title).toBe("Title fr");
        expect(metadata.description).toBe("Description fr");
    });

    it("x-default falls back to the page itself without a translation in the default locale", () => {
        const metadata = articleMetadata(FR_ONLY, "fr");

        expect(metadata.alternates?.languages).toEqual({
            fr: "https://example.com/fr/articles/bonjour",
            "x-default": "https://example.com/fr/articles/bonjour",
        });
    });

    it("OpenGraph of type article, with date and absolute image when it exists", () => {
        expect(articleMetadata(BOTH, "en").openGraph).toEqual({
            title: "Title en",
            description: "Description en",
            url: "https://example.com/articles/hello",
            type: "article",
            locale: "en",
            publishedTime: "2026-11-10",
            images: [{ url: "https://example.com/articles/demo/cover.png" }],
        });
    });

    it("OpenGraph without image when the article has none", () => {
        expect(articleMetadata(BOTH, "fr").openGraph).not.toHaveProperty("images");
    });
});

describe("articleJsonLd", () => {
    it("serializes a BlogPosting with URL, language and image", () => {
        expect(JSON.parse(articleJsonLd(BOTH, "en", "Site"))).toEqual({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: "Title en",
            description: "Description en",
            datePublished: "2026-11-10",
            inLanguage: "en",
            url: "https://example.com/articles/hello",
            mainEntityOfPage: "https://example.com/articles/hello",
            publisher: { "@type": "Organization", name: "Site" },
            image: "https://example.com/articles/demo/cover.png",
        });
    });

    it("omits the missing image and escapes < so it never closes the script tag", () => {
        const entry: ArticleEntry = {
            id: "demo",
            translations: { fr: article("fr", "bonjour", { title: "</script><b>" }) },
        };
        const json = articleJsonLd(entry, "fr", "Site");

        expect(json).not.toContain("<");
        expect(JSON.parse(json).headline).toBe("</script><b>");
        expect(JSON.parse(json)).not.toHaveProperty("image");
    });
});
