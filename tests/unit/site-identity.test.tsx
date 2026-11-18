import { Logo } from "@/components/ui/Logo";
import { buildTheme } from "@/components/ui/material/theme";
import { SITE } from "@/site/config";
import { LOGO_VIEWBOX, LogoMark } from "@/site/logo";
import { useId } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("buildTheme — palette from site/config.ts", () => {
    // Site-agnostic on purpose: a derived site replaces SITE.palette, so no colour is pinned here.
    it.each(["dark", "light"] as const)("uses SITE.palette.%s by default", (mode) => {
        const theme = buildTheme(mode);
        expect(theme.palette.mode).toBe(mode);
        expect(theme.palette.primary.main).toBe(SITE.palette[mode].primary);
        expect(theme.palette.primary.contrastText).toBe(SITE.palette[mode].contrastText);
        expect(theme.palette.secondary.main).toBe(SITE.palette[mode].secondary);
    });

    it("accepts an explicit palette", () => {
        const theme = buildTheme("light", { primary: "#0ea5e9", secondary: "#f97316", contrastText: "#0b1020" });
        expect(theme.palette.primary.main).toBe("#0ea5e9");
        expect(theme.palette.primary.contrastText).toBe("#0b1020");
        expect(theme.palette.secondary.main).toBe("#f97316");
    });

    it("re-points CssBaseline's body background and text at the tokens", () => {
        const overrides = buildTheme("dark").components?.MuiCssBaseline?.styleOverrides;
        expect(overrides).toEqual({
            root: "html,body{margin:0}body{background-color:var(--bg-0);color:var(--text-1)}",
        });
    });
});

const idsOf = (markup: string) => [...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
// The useId value of a component rendered alone at the root (what <Logo /> passes to LogoMark).
function IdProbe() {
    return useId();
}

describe("Logo — frame from Axons, drawing from site/logo.tsx", () => {
    it("names the logo after the site and uses the site's viewBox", () => {
        const html = renderToStaticMarkup(<Logo size={30} />);
        expect(html).toContain(`aria-label="${SITE.name}"`);
        expect(html).toContain('role="img"');
        expect(html).toContain(`viewBox="${LOGO_VIEWBOX}"`);
        expect(html).toContain('width="30"');
        // The drawing is the site's own (site/logo.tsx), whatever it is (rendered with the same id).
        const id = renderToStaticMarkup(<IdProbe />);
        expect(html).toContain(renderToStaticMarkup(<LogoMark id={id} />));
    });

    it("gives every rendered logo its own SVG ids, and every url(#…) points into its own logo", () => {
        // Splash + header (+ a loader) render the logo at once: a literal id in site/logo.tsx would
        // be duplicated, and url(#id) would resolve to the FIRST one (hidden splash => broken paint).
        const html = renderToStaticMarkup(
            <>
                <Logo />
                <Logo className="splash-logo" />
            </>,
        );
        const logos = html.split("</svg>").filter((part) => part.includes("<svg"));
        expect(logos).toHaveLength(2);
        const all = logos.flatMap(idsOf);
        expect(new Set(all).size).toBe(all.length);
        for (const logo of logos) {
            const own = new Set(idsOf(logo));
            for (const [, ref] of logo.matchAll(/url\(#([^)]+)\)/g)) expect(own).toContain(ref);
        }
    });
});
