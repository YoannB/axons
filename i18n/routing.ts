import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { LOCALES, resolveDefaultLocale } from "./locales";

export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: resolveDefaultLocale(process.env.NEXT_PUBLIC_DEFAULT_LOCALE),
    localePrefix: "as-needed", // /privacy (EN); /fr/confidentialite (FR) — no /en
    pathnames: {
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
    },
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
