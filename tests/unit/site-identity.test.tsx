import { Logo } from "@/components/ui/Logo";
import { buildTheme } from "@/components/ui/material/theme";
import { SITE } from "@/site/config";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

describe("buildTheme — palette from site/config.ts", () => {
    it.each(["dark", "light"] as const)("uses SITE.palette.%s by default (Axons values unchanged)", (mode) => {
        const theme = buildTheme(mode);
        expect(theme.palette.mode).toBe(mode);
        expect(theme.palette.primary.main).toBe(SITE.palette[mode].primary);
        expect(theme.palette.primary.contrastText).toBe(SITE.palette[mode].contrastText);
        expect(theme.palette.secondary.main).toBe(SITE.palette[mode].secondary);
        expect(SITE.palette[mode]).toEqual({ primary: "#7c5cff", secondary: "#22d3ee", contrastText: "#fff" });
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

describe("Logo — frame from Axons, drawing from site/logo.tsx", () => {
    it("names the logo after the site and uses the site's viewBox", () => {
        const html = renderToStaticMarkup(<Logo size={30} />);
        expect(html).toContain(`aria-label="${SITE.name}"`);
        expect(html).toContain('role="img"');
        expect(html).toContain('viewBox="0 0 48 48"');
        expect(html).toContain('width="30"');
        expect(html).toContain('class="logo__core"');
    });
});
