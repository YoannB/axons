export const SITE_NAME = "Axons";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const AI_DAILY_LIMIT = Number(process.env.NEXT_PUBLIC_AI_DAILY_LIMIT ?? 0) || 0;
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GITHUB_URL = "https://github.com/YoannB/axons";

export type LocaleCode = "fr" | "en" | "es" | "de" | "it" | "pt";
export interface LocaleMeta {
    code: LocaleCode;
    native: string;
    flag: string;
    active: boolean;
}

export const LOCALES: LocaleMeta[] = [
    { code: "fr", native: "Français", flag: "🇫🇷", active: true },
    { code: "en", native: "English", flag: "🇬🇧", active: true },
    { code: "es", native: "Español", flag: "🇪🇸", active: true },
    { code: "de", native: "Deutsch", flag: "🇩🇪", active: true },
    { code: "it", native: "Italiano", flag: "🇮🇹", active: true },
    { code: "pt", native: "Português", flag: "🇵🇹", active: true },
];

export const NAV = [
    { href: "/", key: "nav.home" },
    { href: "/sitemap", key: "nav.sitemap" },
    { href: "/legal", key: "nav.legal" },
    { href: "/privacy", key: "nav.privacy" },
    { href: "/cookies", key: "nav.cookies" },
] as const;

export interface SeoResource {
    id: string;
    kind: "video" | "article";
    url: string;
    videoId?: string;
    short?: boolean;
    mark: string;
    titleKey: string;
    summaryKey: string;
    sourceKey: string;
    durationKey: string;
}
export const SEO_RESOURCES: SeoResource[] = [
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
];
export const HERO_VIDEO_ID = "jzdTBDmCAKE";

// SYMMETRIC, THIN vertical rails (160x600): symmetry kept (the 160/300
// asymmetry looked bad) AND breathing room in the center (~912px on a 1280 container) => the
// feature-strip and the hero are no longer squashed. Do NOT go back to 300: 300+300 steals
// 600px from the content and squeezes the feature-strip.
export const AD_SIZES = {
    verticalRight: { w: 160, h: 600 },
    verticalLeft: { w: 160, h: 600 },
    horizontal: { w: 728, h: 90 },
} as const;
