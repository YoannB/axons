import { expect, test } from "@playwright/test";
import { resolveSplash, type SiteConfig } from "../../lib/site-extension";
import { SITE } from "../../site/config";

// Pre-hydration splash (#app-splash) and its site option SITE.splash. Site-agnostic: the
// expectations follow the site's own choice (Axons: bar only, no logo).
const SPLASH = resolveSplash((SITE as SiteConfig).splash);

test.describe("Pre-hydration splash", () => {
    test.describe("before any script runs", () => {
        test.use({ javaScriptEnabled: false });

        test("the server HTML shows the splash content the site chose", async ({ page }) => {
            await page.goto("/en");
            const splash = page.locator("#app-splash");
            await expect(splash).toBeVisible();
            await expect(splash.locator("svg.splash-logo")).toHaveCount(SPLASH.logo ? 1 : 0);
            await expect(splash.locator(".loader__bar")).toHaveCount(SPLASH.bar ? 1 : 0);
        });
    });

    test("leaves on hydration (hidden, never removed) and no SVG id is duplicated", async ({ page }) => {
        await page.goto("/en");
        const splash = page.locator("#app-splash");
        await expect(splash).toHaveClass(/is-leaving/);
        await expect(splash).toBeHidden();
        await expect(splash).toHaveCount(1);
        // Splash + header logos (and any other SVG) coexist: url(#id) needs ids unique in the page.
        const ids = await page.locator("svg [id]").evaluateAll((nodes) => nodes.map((n) => n.id));
        expect(new Set(ids).size).toBe(ids.length);
    });
});
