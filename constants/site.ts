import { LOCALES as SERVED_LOCALES } from "@/i18n/locales";
import { resolveTimeZone } from "@/lib/day";
import { isAiEnabled, isConsentRequired } from "@/lib/flags";
import {
    buildNav,
    findCollection,
    headerNav,
    hiddenHrefs,
    validateCollections,
    type CollectionConfig,
    type SeoResource,
} from "@/lib/site-extension";
import { SITE } from "@/site/config";

export type { SeoResource } from "@/lib/site-extension";

// Site identity and chrome come from site/config.ts (owned by a derived site); the names below are
// kept as re-exports so imports do not change. See docs/architecture.md → Deriving a site.
export const SITE_NAME: string = SITE.name;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const AI_DAILY_LIMIT = Number(process.env.NEXT_PUBLIC_AI_DAILY_LIMIT ?? 0) || 0;
// AI feature switch. NEXT_PUBLIC_AI_ENABLED is computed by next.config.ts at build time from the
// PRESENCE of OPENROUTER_API_KEY (only the boolean reaches the client, never the key). No key or a
// daily limit of 0 => every AI surface (buttons, counter, notices, dev reset) is hidden.
export const AI_ENABLED = isAiEnabled(process.env.NEXT_PUBLIC_AI_ENABLED, AI_DAILY_LIMIT);
// Time zone of the AI "day" (client counter AND server quota keys): empty => UTC.
export const AI_QUOTA_TZ = resolveTimeZone(process.env.NEXT_PUBLIC_AI_QUOTA_TZ);
export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
// The cookie banner exists only when a tracker that needs consent is configured (CNIL: no
// banner theatre when the site sets no such tracker; functional storage needs none).
export const CONSENT_REQUIRED = isConsentRequired({ gtmId: GTM_ID, adsEnabled: ADS_ENABLED });
export const GITHUB_URL: string = SITE.githubUrl;

// Site chrome switches (Axons defaults: true / true / 1). A one-page tool can drop the header
// nav (the footer and the HTML sitemap still list every page) and the GitHub links.
export const HEADER_NAV_ENABLED: boolean = SITE.headerNavEnabled;
export const GITHUB_LINK_ENABLED: boolean = SITE.githubLinkEnabled;
/** Brand word: SITE_NAME[0..BRAND_ACCENT_FROM) plain, the rest accented ("A" + "xons"). */
export const BRAND_ACCENT_FROM: number = SITE.brandAccentFrom;

export type LocaleCode = "fr" | "en" | "es" | "de" | "it" | "pt";
export interface LocaleMeta {
    code: LocaleCode;
    native: string;
    flag: string;
    active: boolean;
}

// Display metadata of every SUPPORTED locale. `active` = served on this site (NEXT_PUBLIC_LOCALES,
// single source in i18n/locales.ts): the language switcher lists active locales only.
const LOCALE_META: Omit<LocaleMeta, "active">[] = [
    { code: "fr", native: "Français", flag: "🇫🇷" },
    { code: "en", native: "English", flag: "🇬🇧" },
    { code: "es", native: "Español", flag: "🇪🇸" },
    { code: "de", native: "Deutsch", flag: "🇩🇪" },
    { code: "it", native: "Italiano", flag: "🇮🇹" },
    { code: "pt", native: "Português", flag: "🇵🇹" },
];
export const LOCALES: LocaleMeta[] = LOCALE_META.map((l) => ({
    ...l,
    active: (SERVED_LOCALES as readonly string[]).includes(l.code),
}));

// Markdown articles section (listing, article pages, home "latest articles" block, nav entry and
// sitemap entries). false => every article surface disappears and /articles answers 404; the
// files in content/articles/ stay in the repo but are not published. See docs/articles.md.
export const ARTICLES_ENABLED: boolean = SITE.articlesEnabled;

const AXONS_NAV = [
    { href: "/", key: "nav.home" },
    { href: "/articles", key: "nav.articles" },
    { href: "/sitemap", key: "nav.sitemap" },
    { href: "/legal", key: "nav.legal" },
    { href: "/privacy", key: "nav.privacy" },
    { href: "/cookies", key: "nav.cookies" },
] as const;
// Markdown collections: Axons' articles (the default collection, switched by ARTICLES_ENABLED) +
// the site's own (site/config.ts). See docs/articles.md → Collections.
export const ARTICLES_COLLECTION = {
    id: "articles",
    enabled: ARTICLES_ENABLED,
    href: "/articles",
    itemHref: "/articles/[slug]",
    namespace: "pages.articles",
    schemaType: "BlogPosting",
} as const satisfies CollectionConfig;
export const COLLECTIONS = validateCollections([ARTICLES_COLLECTION, ...SITE.collections]);
export type Collection = (typeof COLLECTIONS)[number];
export const getCollection = (id: string): Collection => findCollection(COLLECTIONS, id);
/** Routes of the disabled collections (nav and sitemap.xml skip them). */
export const HIDDEN_HREFS: readonly string[] = hiddenHrefs(COLLECTIONS);

// Footer + HTML sitemap: every entry (site entries after Home). Header: HEADER_NAV.
export const NAV = buildNav(AXONS_NAV, SITE.nav, HIDDEN_HREFS);
export const HEADER_NAV = headerNav(NAV);

export const SEO_RESOURCES: readonly SeoResource[] = SITE.seoResources;
export const HERO_VIDEO_ID: string = SITE.heroVideoId;

// SYMMETRIC, THIN vertical rails (160x600): symmetry kept (the 160/300
// asymmetry looked bad) AND breathing room in the center (~912px on a 1280 container) => the
// feature-strip and the hero are no longer squashed. Do NOT go back to 300: 300+300 steals
// 600px from the content and squeezes the feature-strip.
export const AD_SIZES = {
    verticalRight: { w: 160, h: 600 },
    verticalLeft: { w: 160, h: 600 },
    horizontal: { w: 728, h: 90 },
} as const;
