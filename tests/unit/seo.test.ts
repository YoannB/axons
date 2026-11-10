// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const SITE_URL = vi.hoisted(() => "https://example.com");

const routing = vi.hoisted(() => ({
    locales: ["en", "fr"],
    defaultLocale: "en",
}));

const getPathname = vi.hoisted(() => ({ locale, href }: { locale: string; href: string }) => {
    if (locale === routing.defaultLocale) {
        return href;
    }

    return href === "/" ? `/${locale}` : `/${locale}${href}`;
});

vi.mock("@/constants/site", () => ({
    SITE_URL,
}));

vi.mock("@/i18n/routing", () => ({
    routing,
    getPathname,
}));

import { pageMetadata } from "@/lib/seo";

describe("pageMetadata — métadonnées de base", () => {
    it("retourne le titre et la description fournis", () => {
        const metadata = pageMetadata({
            title: "Titre",
            description: "Description",
            href: "/",
        });

        expect(metadata.title).toBe("Titre");
        expect(metadata.description).toBe("Description");
    });
});

describe("pageMetadata — canonical", () => {
    it("construit le canonical depuis la locale par défaut", () => {
        const metadata = pageMetadata({
            title: "Legal",
            description: "Legal page",
            href: "/legal",
        });

        expect(metadata.alternates?.canonical).toBe("https://example.com/legal");
    });

    it("normalise la racine avec un slash final", () => {
        const metadata = pageMetadata({
            title: "Home",
            description: "Home page",
            href: "/",
        });

        expect(metadata.alternates?.canonical).toBe("https://example.com/");
    });
});

describe("pageMetadata — hreflang", () => {
    it("ajoute une entrée par locale configurée", () => {
        const metadata = pageMetadata({
            title: "Privacy",
            description: "Privacy page",
            href: "/privacy",
        });

        expect(metadata.alternates?.languages).toMatchObject({
            en: "https://example.com/privacy",
            fr: "https://example.com/fr/privacy",
        });
    });

    it("ajoute x-default aligné sur la locale par défaut", () => {
        const metadata = pageMetadata({
            title: "Cookies",
            description: "Cookies page",
            href: "/cookies",
        });

        expect(metadata.alternates?.languages?.["x-default"]).toBe("https://example.com/cookies");
    });

    it("ne produit pas de double slash sur la racine localisée", () => {
        const metadata = pageMetadata({
            title: "Home",
            description: "Home page",
            href: "/",
        });

        expect(metadata.alternates?.languages).toEqual({
            en: "https://example.com/",
            fr: "https://example.com/fr",
            "x-default": "https://example.com/",
        });
    });
});

describe("pageMetadata — OpenGraph", () => {
    it("duplique titre, description, URL canonique, type et locale", () => {
        const metadata = pageMetadata({
            title: "Sitemap",
            description: "Sitemap page",
            href: "/sitemap",
        });

        expect(metadata.openGraph).toEqual({
            title: "Sitemap",
            description: "Sitemap page",
            url: "https://example.com/sitemap",
            type: "website",
            locale: "en",
        });
    });
});
