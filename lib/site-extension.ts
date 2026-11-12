// PURE module (no next-intl, no process.env, no fs): the contract between Axons and a derived
// site, plus the merges that plug the site's declarations into Axons. A derived site owns the
// `site/` folder (config.ts + messages/<locale>.json) and edits no Axons file; see
// docs/architecture.md → Deriving a site.

/** A localized pathname: one path for every locale, or one path per locale. */
export type SitePathname = string | Readonly<Record<string, string>>;
export type SitePathnames = Readonly<Record<string, SitePathname>>;

/** One navigation entry declared by the site. `key` = message key in the `nav` namespace ("nav.services"). */
export interface SiteNavEntry<Href extends string = string> {
    readonly href: Href;
    readonly key: `nav.${string}`;
    /** false => footer + HTML sitemap only (keeps the header short). Default: true. */
    readonly header?: boolean;
}

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

/** Everything that makes a site itself rather than Axons. Implemented by `site/config.ts`. */
export interface SiteConfig<P extends SitePathnames = SitePathnames> {
    readonly name: string;
    /** Root metadata fallbacks (pages set their own localized title/description). */
    readonly defaultTitle: string;
    readonly defaultDescription: string;
    readonly githubUrl: string;
    /** Brand word: name[0..brandAccentFrom) plain, the rest accented ("A" + "xons"). */
    readonly brandAccentFrom: number;
    /** false => no header nav nor burger (the footer and the HTML sitemap still list every page). */
    readonly headerNavEnabled: boolean;
    readonly githubLinkEnabled: boolean;
    /** Markdown articles section (see docs/articles.md). */
    readonly articlesEnabled: boolean;
    readonly seoResources: readonly SeoResource[];
    readonly heroVideoId: string;
    /** The site's OWN localized routes, merged into i18n/routing.ts (a duplicate Axons key throws). */
    readonly pathnames: P;
    /** The site's nav entries, inserted after "Home" in header, footer and HTML sitemap. */
    readonly nav: readonly SiteNavEntry<Extract<keyof P, string>>[];
    /**
     * Message paths (dotted, e.g. "meta.home") whose Axons value the site messages may REPLACE.
     * Any other collision between site/messages and messages/ throws at build time.
     */
    readonly messageOverrides: readonly string[];
}

export interface NavEntry {
    readonly href: string;
    readonly key: string;
    readonly header?: boolean;
}

/**
 * Axons nav + site nav: site entries go right after the first Axons entry (Home), so Axons'
 * utility pages (articles, sitemap, legal…) stay last. "/articles" is dropped when the section is off.
 */
export function buildNav<A extends NavEntry, S extends NavEntry>(
    axons: readonly A[],
    site: readonly S[],
    articlesEnabled: boolean,
): (A | S)[] {
    const base = axons.filter((n) => articlesEnabled || n.href !== "/articles");
    return [...base.slice(0, 1), ...site, ...base.slice(1)];
}

/** Entries shown in the header (an entry is in the header unless it says `header: false`). */
export function headerNav<E extends NavEntry>(nav: readonly E[]): E[] {
    return nav.filter((n) => n.header !== false);
}

/** Axons pathnames + site pathnames. A site key that redefines an Axons route throws. */
export function mergePathnames<A extends SitePathnames, S extends SitePathnames>(axons: A, site: S): A & S {
    const clash = Object.keys(site).filter((key) => Object.hasOwn(axons, key));
    if (clash.length > 0) {
        throw new Error(
            `site/config.ts pathnames redefine Axons routes: ${clash.join(", ")}. Use another logical key.`,
        );
    }
    return { ...axons, ...site };
}

/** Logical key of a STATIC route of `P` (no dynamic `[param]` segment). */
export type StaticHref<P> = Exclude<Extract<keyof P, string>, `${string}[${string}`>;

/** Logical keys of the STATIC routes (no dynamic `[param]` segment), in declaration order. */
export function staticHrefs<P extends SitePathnames>(pathnames: P): StaticHref<P>[] {
    return Object.keys(pathnames).filter((href) => !href.includes("[")) as StaticHref<P>[];
}

export type Messages = { [key: string]: unknown };

const isTree = (value: unknown): value is Messages =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const allowed = (path: string, overrides: readonly string[]) =>
    overrides.some((o) => path === o || path.startsWith(`${o}.`));

/**
 * Deep merge of the site messages INTO the Axons messages. New keys are added; a key present on
 * both sides is a collision: replaced when its path (or a parent path) is listed in `overrides`,
 * otherwise an error naming the path (no silent overwrite of Axons copy).
 */
export function mergeMessages(axons: Messages, site: Messages, overrides: readonly string[], prefix = ""): Messages {
    const result: Messages = { ...axons };
    for (const [key, value] of Object.entries(site)) {
        const path = prefix ? `${prefix}.${key}` : key;
        const current = result[key];
        if (current === undefined) {
            result[key] = value;
        } else if (isTree(current) && isTree(value)) {
            result[key] = mergeMessages(current, value, overrides, path);
        } else if (allowed(path, overrides)) {
            result[key] = value;
        } else {
            throw new Error(
                `site/messages overrides the Axons message "${path}". List "${path}" (or a parent) in ` +
                    `site/config.ts messageOverrides to replace it on purpose, or rename the key.`,
            );
        }
    }
    return result;
}
