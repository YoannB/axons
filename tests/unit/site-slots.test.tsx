import { AxonsHome } from "@/components/home/AxonsHome";
import { DefaultShell } from "@/components/layout/DefaultShell";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHome } from "@/site/home";
import { SiteShell } from "@/site/shell";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

// next-intl's navigation factory imports "next/navigation", which does not resolve under Vitest:
// the elements below are never rendered, so the routing module is stubbed, and the "server-only"
// guard of the content source (pulled in by LatestArticles) is neutralized.
vi.mock("server-only", () => ({}));
vi.mock("@/i18n/routing", () => ({
    routing: { locales: ["en"], defaultLocale: "en" },
    Link: () => null,
    usePathname: () => "/",
    useRouter: () => ({}),
    getPathname: () => "/",
    redirect: () => undefined,
}));

// The two component slots of site/ (docs/architecture.md → Deriving a site). Axons ships them as
// re-exports of its own frame and home, so its behaviour is unchanged; a derived site replaces them.
// The elements are inspected WITHOUT rendering (Header/Footer need the next-intl providers; the
// rendered result is covered by the e2e specs).
type El = ReactElement<{ children?: ReactNode; locale?: string }>;

describe("site/shell.tsx — page frame slot", () => {
    it("is Axons' DefaultShell by default", () => {
        expect(SiteShell).toBe(DefaultShell);
    });

    it("renders header, the <main> landmark around the page, then footer", () => {
        const page = <p>page</p>;
        const frame = DefaultShell({ children: page, locale: "en" }) as El;
        const parts = (frame.props.children as El[]).filter(isValidElement) as El[];
        expect(parts.map((p) => p.type)).toEqual([Header, "main", Footer]);
        expect(parts[1].props.children).toBe(page);
    });
});

describe("site/home.tsx — home body slot", () => {
    it("is Axons' AxonsHome by default", () => {
        expect(SiteHome).toBe(AxonsHome);
    });

    it("wraps the home sections in PageShell and passes the locale to the latest articles", () => {
        const home = AxonsHome({ locale: "fr" }) as El;
        expect(home.type).toBe(PageShell);
        const sections = home.props.children as El[];
        expect(sections).toHaveLength(6);
        expect(sections.filter((s) => s.props.locale === "fr")).toHaveLength(1);
    });
});
