// @vitest-environment node
import { DefaultOgImage } from "@/components/og/DefaultOgImage";
import { COLLECTIONS, OG_PAGES } from "@/constants/site";
import type { OgImageProps, SiteConfig } from "@/lib/site-extension";
import { SITE } from "@/site/config";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// site/og-image.tsx pulls the font/logo loaders (lib/og/assets.ts, server-only); nothing is read here.
vi.mock("server-only", () => ({}));

const { SITE_OG_IMAGE } = await import("@/site/og-image");

// SITE-AGNOSTIC: the mechanisms (site declarations reach their consumers), never site values.
describe("OG_PAGES — which pages get their own social image", () => {
    it("always includes the home", () => {
        expect(OG_PAGES["/"]).toBeTruthy();
    });

    it("includes the listing of every ENABLED collection, under its namespace", () => {
        for (const c of COLLECTIONS) {
            if (c.enabled) expect(OG_PAGES[c.href]).toBe(c.namespace);
            else expect(OG_PAGES).not.toHaveProperty(c.href);
        }
    });

    it("includes every page the site declares in SITE.ogPages", () => {
        const declared = (SITE as SiteConfig).ogPages ?? {};
        for (const [href, namespace] of Object.entries(declared)) expect(OG_PAGES[href]).toBe(namespace);
    });
});

describe("SITE_OG_IMAGE — contract of site/og-image.tsx", () => {
    it("declares a component, a theme, a font family and the two loaders", () => {
        expect(typeof SITE_OG_IMAGE.Image).toBe("function");
        expect(SITE_OG_IMAGE.fontFamily).toBeTruthy();
        expect(typeof SITE_OG_IMAGE.fonts).toBe("function");
        expect(typeof SITE_OG_IMAGE.logo).toBe("function");
        for (const colour of Object.values(SITE_OG_IMAGE.theme)) expect(colour).toMatch(/^#[0-9a-f]{6}$/i);
    });
});

const PROPS: OgImageProps = {
    title: "Écrire un article",
    description: "Un dossier par article, un fichier par langue.",
    siteName: "Site",
    host: "example.com",
    locale: "fr",
    logo: "data:image/svg+xml;base64,PHN2Zy8+",
    theme: {
        background: "#000000",
        surface: "#111111",
        text: "#ffffff",
        muted: "#999999",
        accent1: "#7c5cff",
        accent2: "#22d3ee",
    },
    fontFamily: "Geist",
};

describe("DefaultOgImage — Axons' default drawing", () => {
    it("shows the title, description, site name, host and logo in the page language", () => {
        const html = renderToStaticMarkup(<DefaultOgImage {...PROPS} />);
        for (const text of [PROPS.title, PROPS.description, PROPS.siteName, PROPS.host]) expect(html).toContain(text);
        expect(html).toContain('lang="fr"');
        expect(html).toContain(`src="${PROPS.logo}"`);
        expect(html).toContain("font-family:Geist");
    });

    it("adds the section badge and the cover only when given", () => {
        const bare = renderToStaticMarkup(<DefaultOgImage {...PROPS} />);
        expect(bare).not.toContain("Articles");
        expect(bare.match(/<img/g)).toHaveLength(1);

        const full = renderToStaticMarkup(
            <DefaultOgImage {...PROPS} section="Articles" cover="data:image/png;base64,AA==" />,
        );
        expect(full).toContain("Articles");
        expect(full).toContain('src="data:image/png;base64,AA=="');
    });

    it("omits the description block when the page has none", () => {
        const html = renderToStaticMarkup(<DefaultOgImage {...PROPS} description="" />);
        expect(html).not.toContain("font-size:30px");
    });
});
