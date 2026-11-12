// @vitest-environment node
import { NAV } from "@/constants/site";
import { buildNav, headerNav, mergeMessages, mergePathnames, staticHrefs } from "@/lib/site-extension";
import { SITE } from "@/site/config";
import { describe, expect, it } from "vitest";

const AXONS_NAV = [
    { href: "/", key: "nav.home" },
    { href: "/articles", key: "nav.articles" },
    { href: "/legal", key: "nav.legal" },
] as const;
const SITE_NAV = [
    { href: "/about", key: "nav.about" },
    { href: "/contact", key: "nav.contact", header: false },
] as const;

describe("buildNav", () => {
    it("inserts the site entries right after Home", () => {
        expect(buildNav(AXONS_NAV, SITE_NAV, true).map((n) => n.href)).toEqual([
            "/",
            "/about",
            "/contact",
            "/articles",
            "/legal",
        ]);
    });

    it("drops /articles when the section is off", () => {
        expect(buildNav(AXONS_NAV, SITE_NAV, false).map((n) => n.href)).toEqual(["/", "/about", "/contact", "/legal"]);
    });

    it("keeps the Axons nav unchanged without site entries", () => {
        expect(buildNav(AXONS_NAV, [], true)).toEqual(AXONS_NAV);
    });
});

describe("headerNav", () => {
    it("keeps entries without a header flag or with header: true, drops header: false", () => {
        const nav = [...AXONS_NAV, ...SITE_NAV, { href: "/x", key: "nav.x", header: true }];
        expect(headerNav(nav).map((n) => n.href)).toEqual(["/", "/articles", "/legal", "/about", "/x"]);
    });
});

describe("mergePathnames", () => {
    const axons = { "/": "/", "/legal": { fr: "/mentions-legales", en: "/legal" } } as const;

    it("adds the site routes after the Axons routes", () => {
        const merged = mergePathnames(axons, { "/about": { fr: "/a-propos", en: "/about" } });
        expect(Object.keys(merged)).toEqual(["/", "/legal", "/about"]);
        expect(merged["/about"]).toEqual({ fr: "/a-propos", en: "/about" });
    });

    it("throws when the site redefines an Axons route", () => {
        expect(() => mergePathnames(axons, { "/legal": "/imprint", "/ok": "/ok" })).toThrow(
            "site/config.ts pathnames redefine Axons routes: /legal",
        );
    });
});

describe("staticHrefs", () => {
    it("keeps static routes in order and drops dynamic [param] routes", () => {
        expect(staticHrefs({ "/": "/", "/articles/[slug]": "/a/[slug]", "/about": "/about" })).toEqual(["/", "/about"]);
    });
});

describe("mergeMessages", () => {
    const axons = { nav: { home: "Home", legal: "Legal" }, meta: { home: { title: "Axons" } }, list: ["a"] };

    it("adds new site keys at any depth without touching Axons keys", () => {
        const merged = mergeMessages(axons, { nav: { about: "About" }, services: { title: "Services" } }, []);
        expect(merged).toEqual({
            ...axons,
            nav: { home: "Home", legal: "Legal", about: "About" },
            services: { title: "Services" },
        });
        expect(axons.nav).toEqual({ home: "Home", legal: "Legal" });
    });

    it("throws on a leaf collision that is not declared, naming the path", () => {
        expect(() => mergeMessages(axons, { nav: { home: "Accueil" } }, [])).toThrow(
            'site/messages overrides the Axons message "nav.home"',
        );
    });

    it("throws when a site object replaces an Axons string (or an array)", () => {
        expect(() => mergeMessages(axons, { nav: { home: { a: "b" } } }, [])).toThrow('"nav.home"');
        expect(() => mergeMessages(axons, { list: { a: "b" } }, [])).toThrow('"list"');
    });

    it("replaces a collision listed exactly in overrides", () => {
        expect(mergeMessages(axons, { nav: { home: "Start" } }, ["nav.home"]).nav).toEqual({
            home: "Start",
            legal: "Legal",
        });
    });

    it("replaces every collision below a listed parent path", () => {
        const merged = mergeMessages(axons, { meta: { home: { title: "EZJSDEV" } } }, ["meta"]);
        expect(merged.meta).toEqual({ home: { title: "EZJSDEV" } });
    });

    it("does not treat a mere name prefix as a parent path", () => {
        expect(() => mergeMessages(axons, { nav: { home: "Start" } }, ["nav.hom"])).toThrow('"nav.home"');
    });

    it("replaces a whole subtree when the override path is a non-object on one side", () => {
        expect(mergeMessages(axons, { list: ["b"] }, ["list"]).list).toEqual(["b"]);
    });
});

// The shipped site layer (Axons' own, or a derived site's) must merge cleanly for every locale:
// a forgotten override or a renamed Axons key fails here before it fails the build.
describe("shipped site layer", () => {
    for (const locale of ["fr", "en", "es", "de", "it", "pt"]) {
        it(`site/messages/${locale}.json merges into messages/${locale}.json`, async () => {
            const axons = (await import(`../../messages/${locale}.json`)).default;
            const site = (await import(`../../site/messages/${locale}.json`)).default;
            const merged = mergeMessages(axons, site, SITE.messageOverrides) as { nav: Record<string, unknown> };
            // Every nav entry (Axons + site) has a label in this locale.
            for (const entry of NAV) expect(merged.nav[entry.key.split(".")[1]], entry.key).toBeTypeOf("string");
        });
    }

    it("every site nav entry targets a site pathname", () => {
        const keys: string[] = Object.keys(SITE.pathnames);
        for (const entry of SITE.nav as readonly { href: string }[]) expect(keys).toContain(entry.href);
    });
});
