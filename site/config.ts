import type { SiteConfig } from "@/lib/site-extension";

// THE SITE'S OWN CONFIGURATION — the file a derived site replaces (with site/messages/*.json).
// Axons ships its own identity here; everything else (env, flags, locales, layout constants)
// stays in constants/site.ts, which re-exports these values under their historical names.
// Contract and merge rules: lib/site-extension.ts; guide: docs/architecture.md → Deriving a site.

// The site's own localized routes (logical key → path, or one path per locale), merged into
// i18n/routing.ts. Example: { "/about": { fr: "/a-propos", en: "/about", es: "/acerca-de",
// de: "/uber-uns", it: "/chi-siamo", pt: "/sobre" }, "/services": "/services" }.
const pathnames = {} as const;

export const SITE = {
    name: "Axons",
    defaultTitle: "Axons — Next.js AI/SEO boilerplate",
    defaultDescription: "Next.js 16 boilerplate for SEO and AI (OpenRouter), deployable on Netlify.",
    githubUrl: "https://github.com/YoannB/axons",
    brandAccentFrom: 1,
    headerNavEnabled: true,
    githubLinkEnabled: true,
    articlesEnabled: true,
    seoResources: [
        {
            id: "yt",
            kind: "video",
            url: "https://www.youtube.com/watch?v=jzdTBDmCAKE",
            videoId: "jzdTBDmCAKE",
            short: false,
            mark: "YT",
            titleKey: "seo.a1.title",
            summaryKey: "seo.a1.summary",
            sourceKey: "seo.a1.source",
            durationKey: "seo.a1.duration",
        },
        {
            id: "oc",
            kind: "article",
            url: "https://openclassrooms.com/fr/courses/8710351-creez-une-application-react-avec-next-js/8856186-demarrez-un-projet-next-js",
            mark: "OC",
            titleKey: "seo.a2.title",
            summaryKey: "seo.a2.summary",
            sourceKey: "seo.a2.source",
            durationKey: "seo.a2.duration",
        },
        {
            id: "ti",
            kind: "article",
            url: "https://tech-insider.org/fr/nextjs-16-tutoriel-app-full-stack-13-etapes-2026/",
            mark: "TI",
            titleKey: "seo.a3.title",
            summaryKey: "seo.a3.summary",
            sourceKey: "seo.a3.source",
            durationKey: "seo.a3.duration",
        },
    ],
    heroVideoId: "jzdTBDmCAKE",
    // MUI palette per mode (buttons, chips, focus rings…). CSS tokens (--accent-1, --bg-0, --btn-fg…)
    // are overridden in site/theme.css; keep both in step when rebranding.
    palette: {
        dark: { primary: "#7c5cff", secondary: "#22d3ee", contrastText: "#fff" },
        light: { primary: "#7c5cff", secondary: "#22d3ee", contrastText: "#fff" },
    },
    pathnames,
    // Example: [{ href: "/about", key: "nav.about" }, { href: "/services", key: "nav.services", header: false }]
    // (labels go in site/messages/<locale>.json under "nav").
    nav: [],
    // Example: [{ id: "reminders", enabled: true, href: "/reminders", itemHref: "/reminders/[slug]",
    // namespace: "pages.reminders", schemaType: "TechArticle" }] + content/reminders/ + both routes
    // in `pathnames` + two page files (docs/articles.md → Collections).
    collections: [],
    // Example: ["meta.home", "hero"] lets site/messages replace Axons' home metadata and hero copy.
    messageOverrides: [],
} as const satisfies SiteConfig<typeof pathnames>;
