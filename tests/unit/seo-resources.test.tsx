import { SeoResources } from "@/components/home/SeoResources";
import { AppStateProvider } from "@/providers/AppStateProvider";
import messages from "@/messages/en.json";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mutable stand-ins for the two site values (read at render through live bindings).
const site = vi.hoisted(() => ({ heroVideoId: "", resources: [] as unknown[] }));
vi.mock("@/constants/site", async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return {
        ...actual,
        get HERO_VIDEO_ID() {
            return site.heroVideoId;
        },
        get SEO_RESOURCES() {
            return site.resources;
        },
    };
});

// The components/ui barrel reaches next-intl navigation (not resolvable under Vitest): stub it.
vi.mock("@/i18n/routing", () => ({
    Link: ({ children }: { children: unknown }) => children,
    usePathname: () => "/",
    useRouter: () => ({ replace: () => undefined }),
    getPathname: () => "/",
    routing: { locales: ["en"], defaultLocale: "en" },
}));

const ARTICLE = {
    id: "oc",
    kind: "article",
    url: "https://example.com/a",
    mark: "OC",
    titleKey: "seo.a2.title",
    summaryKey: "seo.a2.summary",
    sourceKey: "seo.a2.source",
    durationKey: "seo.a2.duration",
};

const render = () =>
    renderToStaticMarkup(
        <NextIntlClientProvider locale="en" messages={messages} timeZone="UTC">
            <AppStateProvider initialThemeMode="dark" initialConsent={null}>
                <SeoResources />
            </AppStateProvider>
        </NextIntlClientProvider>,
    );

describe("SeoResources — empty states", () => {
    beforeEach(() => {
        site.heroVideoId = "";
        site.resources = [];
    });

    it("renders nothing when there is neither a hero video nor resources", () => {
        expect(render()).toBe("");
    });

    it("renders the cards without any player when the hero video is empty", () => {
        site.resources = [ARTICLE];
        const html = render();
        expect(html).toContain('id="seo"');
        expect(html).toContain("seo__articles-grid");
        expect(html).not.toContain("seo-video");
        expect(html).not.toContain("ytimg");
    });

    it("renders the player without the cards grid when there are no resources", () => {
        site.heroVideoId = "abc123";
        const html = render();
        expect(html).toContain("seo-video-slot");
        expect(html).not.toContain("seo__articles");
    });
});
