import { expect, test, type Page } from "@playwright/test";
import { acceptCookiesButton, cookieBanner } from "./support/home";

// v0.3.0 site configuration: consent can be re-opened from the footer, the scripted terminal
// demo runs without any network call, and the security headers keep same-origin framing.
// These specs assume a consent-requiring tracker is configured (CI sets NEXT_PUBLIC_ADS_ENABLED).

async function hydrated(page: Page) {
    await expect(page.locator("#app-splash")).toHaveClass(/is-leaving/);
}

test.describe("Site configuration", () => {
    test("an unknown URL shows the localized 404, not the frozen splash", async ({ page }) => {
        // Regression: without app/[locale]/[...rest] Next rendered its default 404 outside the
        // [locale] layout (no SplashLoader), so the splash never left the screen.
        // Unprefixed path first: once a locale is visited, its cookie redirects "/dsqd" there.
        for (const [url, button] of [
            ["/dsqd", "Back to home"],
            ["/fr/dsqd", "Retour à l'accueil"],
            ["/de/a/b", "Zurück zur Startseite"],
        ]) {
            await page.goto(url);
            await hydrated(page);
            await expect(page.getByRole("banner")).toBeVisible();
            await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
            await expect(page.getByRole("link", { name: button })).toBeVisible();
        }
    });

    test("a path outside any locale shows the neutral 404 without splash", async ({ page }) => {
        const response = await page.goto("/x.y");
        expect(response?.status()).toBe(404);
        await expect(page.locator("#app-splash")).toBeHidden();
        await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
    });

    test("home stays at the top of the page after hydration", async ({ page }) => {
        // Regression: the showcase Tabs used scrollIntoView on mount, which scrolled the WINDOW
        // down to the terminal demo. The strip must scroll itself only.
        await page.goto("/fr");
        await hydrated(page);
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('"Manage my cookies" reopens the banner after a choice', async ({ page }) => {
        await page.goto("/");
        await hydrated(page);
        await acceptCookiesButton(page).click();
        await expect(cookieBanner(page)).toBeHidden();

        await page.getByRole("contentinfo").getByRole("button", { name: "Manage cookies" }).click();
        await expect(cookieBanner(page)).toBeVisible();

        // Re-opening keeps the previous choice: the visitor can now change it.
        await acceptCookiesButton(page).click();
        await expect(cookieBanner(page)).toBeHidden();
    });

    test("the terminal demo plays the scripted sequence without network requests", async ({ page }) => {
        await page.goto("/fr");
        await hydrated(page);
        const calls: string[] = [];
        page.on("request", (r) => {
            if (r.url().includes("/api/")) calls.push(r.url());
        });
        const showcase = page.locator("#showcase");
        await showcase.getByRole("button", { name: "Lancer la démo" }).click();

        const log = showcase.getByRole("log", { name: "Démo scénarisée" });
        await expect(log).toContainText("npm run demo");
        await expect(log).toContainText("aucun appel IA", { timeout: 10_000 });
        await expect(showcase.getByRole("button", { name: "Lancer la démo" })).toBeEnabled();
        expect(calls).toEqual([]);
    });

    test("with prefers-reduced-motion, the sequence shows at once", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/fr");
        await hydrated(page);
        const showcase = page.locator("#showcase");
        await showcase.getByRole("button", { name: "Lancer la démo" }).click();
        await expect(showcase.getByRole("log", { name: "Démo scénarisée" }).locator(".terminal__line")).toHaveCount(5, {
            timeout: 500,
        });
    });

    test("tabs switch panels", async ({ page }) => {
        await page.goto("/fr");
        await hydrated(page);
        const showcase = page.locator("#showcase");
        await showcase.getByRole("button", { name: "Problèmes" }).click();
        await expect(showcase.getByRole("button", { name: "Problèmes" })).toHaveAttribute("aria-pressed", "true");
        await expect(showcase.getByText("Aucun problème détecté.")).toBeVisible();
    });

    test("no ad placeholder in a production build", async ({ page }) => {
        // CI serves `next start` (production): placeholders are a development aid only, the
        // slots must render nothing until real tags exist (docs/seo-layout.md → Ads).
        test.skip(!process.env.CI, "local runs use next dev, where placeholders are expected");
        await page.goto("/");
        await hydrated(page);
        await expect(page.locator(".ad-slot")).toHaveCount(0);
    });

    test("headers: framing limited to the same origin by default", async ({ request }) => {
        const res = await request.get("/");
        expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
        expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
    });
});
