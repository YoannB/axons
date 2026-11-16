// PURE module (no next-intl, no process.env, no fs): the contract between Axons and a derived
// site, plus the merges that plug the site's declarations into Axons. A derived site owns the
// `site/` folder (config.ts + messages/<locale>.json) and edits no Axons file; see
// docs/architecture.md → Deriving a site.
import type { ReactNode } from "react";

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

/** schema.org type emitted as JSON-LD on an entry page. */
export type CollectionSchemaType = "BlogPosting" | "TechArticle" | "Article";

/**
 * A Markdown collection: `content/<id>/<entry>/<locale>.md`, a listing route and an entry route.
 * Axons' own articles are the default collection (`id: "articles"`); a site declares more in
 * `SITE.collections` and adds two delegating page files (docs/articles.md → Collections).
 */
export interface CollectionConfig<Href extends string = string> {
    /** Folder under content/ (kebab-case), also the collection key used by the page factories. */
    readonly id: string;
    /** false => listing and entries answer 404, and the nav / sitemap entries disappear. */
    readonly enabled: boolean;
    /** Logical key of the listing route (static), e.g. "/reminders". */
    readonly href: string extends Href ? string : Exclude<Href, `${string}[${string}`>;
    /** Logical key of the entry route, ending with "/[slug]", e.g. "/reminders/[slug]". */
    readonly itemHref: string extends Href ? string : Extract<Href, `${string}/[slug]`>;
    /** Messages namespace: title, intro, empty, publishedOn, onlyIn (+ latestTitle, viewAll). */
    readonly namespace: string;
    readonly schemaType: CollectionSchemaType;
}

/** MUI colours of one theme mode (hex): primary/secondary main and the text drawn ON the primary. */
export interface SitePaletteMode {
    readonly primary: string;
    readonly secondary: string;
    readonly contrastText: string;
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
    /** Hero video of the SEO block; "" (with no seoResources either) removes the whole block. */
    readonly heroVideoId: string;
    /** MUI palette per mode, read by buildTheme (the CSS tokens are overridden in site/theme.css). */
    readonly palette: { readonly dark: SitePaletteMode; readonly light: SitePaletteMode };
    /** The site's OWN localized routes, merged into i18n/routing.ts (a duplicate Axons key throws). */
    readonly pathnames: P;
    /** The site's nav entries, inserted after "Home" in header, footer and HTML sitemap. */
    readonly nav: readonly SiteNavEntry<Extract<keyof P, string>>[];
    /** The site's own Markdown collections (routes declared in `pathnames`), next to Axons' articles. */
    readonly collections: readonly CollectionConfig<Extract<keyof P, string>>[];
    /**
     * Message paths (dotted, e.g. "meta.home") whose Axons value the site messages may REPLACE.
     * Any other collision between site/messages and messages/ throws at build time.
     */
    readonly messageOverrides: readonly string[];
}

/**
 * Props of the page FRAME a site renders around every page under `app/[locale]/` (`site/shell.tsx`
 * exports `SiteShell`). The frame owns the `<main>` landmark and the header/footer chrome; the
 * segment layout keeps the providers, the cookie banner, GTM and the splash loader outside it.
 */
export interface SiteShellProps {
    readonly children: ReactNode;
    /** The validated locale of the segment (handy for a Server Component frame reading content). */
    readonly locale: string;
}

/** Props of the home page body (`site/home.tsx` exports `SiteHome`); metadata stays `meta.home`. */
export interface SiteHomeProps {
    readonly locale: string;
}

export interface NavEntry {
    readonly href: string;
    readonly key: string;
    readonly header?: boolean;
}

/**
 * Axons nav + site nav: site entries go right after the first Axons entry (Home), so Axons'
 * utility pages (articles, sitemap, legal…) stay last. `hidden` = routes of disabled collections
 * (see hiddenHrefs): their entries are dropped from both lists.
 */
export function buildNav<A extends NavEntry, S extends NavEntry>(
    axons: readonly A[],
    site: readonly S[],
    hidden: readonly string[],
): (A | S)[] {
    const shown = <E extends NavEntry>(n: E) => !hidden.includes(n.href);
    const base = axons.filter(shown);
    return [...base.slice(0, 1), ...site.filter(shown), ...base.slice(1)];
}

const COLLECTION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Checks the collections (ids, uniqueness, route shapes) and returns them unchanged. */
export function validateCollections<C extends CollectionConfig>(collections: readonly C[]): readonly C[] {
    const seen = new Set<string>();
    for (const c of collections) {
        const where = `collection "${c.id}"`;
        if (!COLLECTION_ID.test(c.id)) throw new Error(`Invalid ${where}: id must be kebab-case (content/<id>/).`);
        if (seen.has(c.id)) throw new Error(`Duplicate ${where} (ids must be unique).`);
        seen.add(c.id);
        if (c.href.includes("[")) throw new Error(`Invalid ${where}: href "${c.href}" must be a static route.`);
        if (!c.itemHref.endsWith("/[slug]")) {
            throw new Error(`Invalid ${where}: itemHref "${c.itemHref}" must end with "/[slug]".`);
        }
    }
    return collections;
}

/** Routes (listing + entry) of the DISABLED collections: hidden from nav and sitemap.xml. */
export function hiddenHrefs(collections: readonly CollectionConfig[]): string[] {
    return collections.filter((c) => !c.enabled).flatMap((c) => [c.href, c.itemHref]);
}

/** The collection `id`, or an error naming the known ids (a typo in a page file fails the build). */
export function findCollection<C extends CollectionConfig>(collections: readonly C[], id: string): C {
    const found = collections.find((c) => c.id === id);
    if (!found) throw new Error(`Unknown collection "${id}" (known: ${collections.map((c) => c.id).join(", ")}).`);
    return found;
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

/** localStorage keys by NAME (`{ ideTabs: "mysite-ide-tabs" }`): declared by Axons and by `site/storage.ts`. */
export type SiteStorageKeys = Readonly<Record<string, string>>;

/**
 * Axons localStorage keys + the site's. A site NAME that redefines an Axons one, a site KEY already
 * used by Axons or declared twice by the site, or an empty key throws: two features sharing one
 * key read each other's data.
 */
export function mergeStorageKeys<A extends SiteStorageKeys, S extends SiteStorageKeys>(axons: A, site: S): A & S {
    const problems: string[] = [];
    const names = Object.keys(site).filter((name) => Object.hasOwn(axons, name));
    if (names.length > 0) problems.push(`names already declared by Axons: ${names.join(", ")}`);
    const seen = new Set(Object.values(axons));
    for (const [name, key] of Object.entries(site)) {
        if (key.trim() === "") problems.push(`empty key for "${name}"`);
        else if (seen.has(key)) problems.push(`key "${key}" ("${name}") is already used`);
        seen.add(key);
    }
    if (problems.length > 0) throw new Error(`site/storage.ts SITE_STORAGE_KEYS: ${problems.join("; ")}.`);
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
