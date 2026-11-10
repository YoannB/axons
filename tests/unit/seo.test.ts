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

describe("pageMetadata — métadonnées de base", () => {
    it("retourne le titre et la description fournis", () => {
        const metadata = pageMetadata({ title: "Titre", description: "Description", href: "/", locale: "en" });

        expect(metadata.title).toBe("Titre");
        expect(metadata.description).toBe("Description");
    });
});

describe("pageMetadata — canonical", () => {
    it("pointe vers l'URL de la locale par défaut sur la page par défaut", () => {
        const metadata = pageMetadata({ title: "Legal", description: "Legal page", href: "/legal", locale: "en" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/legal");
    });

    it("pointe vers l'URL de SA locale sur une traduction (pas vers la locale par défaut)", () => {
        const metadata = pageMetadata({ title: "Légal", description: "Mentions", href: "/legal", locale: "fr" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/fr/legal");
    });

    it("normalise la racine avec un slash final", () => {
        const metadata = pageMetadata({ title: "Home", description: "Home page", href: "/", locale: "en" });

        expect(metadata.alternates?.canonical).toBe("https://example.com/");
    });
});

describe("pageMetadata — hreflang", () => {
    it("ajoute une entrée par locale configurée", () => {
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

    it("ajoute x-default aligné sur la locale par défaut, quelle que soit la page", () => {
        const metadata = pageMetadata({
            title: "Cookies",
            description: "Cookies page",
            href: "/cookies",
            locale: "fr",
        });

        expect(metadata.alternates?.languages?.["x-default"]).toBe("https://example.com/cookies");
    });

    it("ne produit pas de double slash sur la racine localisée", () => {
        const metadata = pageMetadata({ title: "Home", description: "Home page", href: "/", locale: "en" });

        expect(metadata.alternates?.languages).toEqual({
            en: "https://example.com/",
            fr: "https://example.com/fr",
            "x-default": "https://example.com/",
        });
    });
});

describe("pageMetadata — OpenGraph", () => {
    it("duplique titre, description, URL canonique, type et locale de la page", () => {
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
    it("construit le chemin localisé avec le slug traduit", () => {
        expect(articlePath("fr", "bonjour")).toBe("/fr/articles/bonjour");
        expect(articlePath("en", "hello")).toBe("/articles/hello");
    });
});

describe("articleMetadata", () => {
    it("canonical = URL de la traduction affichée, hreflang = traductions existantes", () => {
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

    it("x-default retombe sur la page elle-même sans traduction dans la locale par défaut", () => {
        const metadata = articleMetadata(FR_ONLY, "fr");

        expect(metadata.alternates?.languages).toEqual({
            fr: "https://example.com/fr/articles/bonjour",
            "x-default": "https://example.com/fr/articles/bonjour",
        });
    });

    it("OpenGraph de type article, avec date et image absolue quand elle existe", () => {
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

    it("OpenGraph sans image quand l'article n'en a pas", () => {
        expect(articleMetadata(BOTH, "fr").openGraph).not.toHaveProperty("images");
    });
});

describe("articleJsonLd", () => {
    it("sérialise un BlogPosting avec URL, langue et image", () => {
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

    it("omet l'image absente et échappe < pour ne jamais fermer la balise script", () => {
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
