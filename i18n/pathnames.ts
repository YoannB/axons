import { mergePathnames } from "@/lib/site-extension";
import { SITE } from "@/site/config";

// Axons-owned localized routes. A derived site declares its own in site/config.ts `pathnames`;
// they are merged below (a key that redefines an Axons route throws at build time).
const AXONS_PATHNAMES = {
    "/": "/",
    "/sitemap": {
        fr: "/plan-du-site",
        en: "/sitemap",
        es: "/mapa-del-sitio",
        de: "/sitemap",
        it: "/mappa-del-sito",
        pt: "/mapa-do-site",
    },
    "/legal": {
        fr: "/mentions-legales",
        en: "/legal",
        es: "/aviso-legal",
        de: "/impressum",
        it: "/note-legali",
        pt: "/aviso-legal",
    },
    "/privacy": {
        fr: "/confidentialite",
        en: "/privacy",
        es: "/privacidad",
        de: "/datenschutz",
        it: "/privacy",
        pt: "/privacidade",
    },
    "/articles": {
        fr: "/articles",
        en: "/articles",
        es: "/articulos",
        de: "/artikel",
        it: "/articoli",
        pt: "/artigos",
    },
    // [slug] = the TRANSLATED slug of the article (front matter), different per locale.
    "/articles/[slug]": {
        fr: "/articles/[slug]",
        en: "/articles/[slug]",
        es: "/articulos/[slug]",
        de: "/artikel/[slug]",
        it: "/articoli/[slug]",
        pt: "/artigos/[slug]",
    },
    "/cookies": {
        fr: "/cookies",
        en: "/cookies",
        es: "/cookies",
        de: "/cookies",
        it: "/cookies",
        pt: "/cookies",
    },
} as const;

// Merged Axons + site pathnames. Kept out of i18n/routing.ts (which pulls next-intl/navigation, so
// next/navigation) so plain Node code — Playwright specs — can resolve localized paths too.
export const PATHNAMES = mergePathnames(AXONS_PATHNAMES, SITE.pathnames);
