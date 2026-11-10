import { expect, test, type Page } from "@playwright/test";
import { acceptCookiesButton, cookieBanner } from "./support/home";

// v0.3.0 site configuration: consent can be re-opened from the footer, the scripted terminal
// demo runs without any network call, and the security headers keep same-origin framing.
// These specs assume a consent-requiring tracker is configured (CI sets NEXT_PUBLIC_ADS_ENABLED).

async function hydrated(page: Page) {
    await expect(page.locator("#app-splash")).toHaveClass(/is-leaving/);
}

test.describe("Configuration du site", () => {
    test("l'accueil reste en haut de page après l'hydratation", async ({ page }) => {
        // Regression: the showcase Tabs used scrollIntoView on mount, which scrolled the WINDOW
        // down to the terminal demo. The strip must scroll itself only.
        await page.goto("/fr");
        await hydrated(page);
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("« Gérer mes cookies » rouvre le bandeau après un choix", async ({ page }) => {
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

    test("la démo terminal déroule la séquence scénarisée sans requête réseau", async ({ page }) => {
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

    test("avec prefers-reduced-motion, la séquence s'affiche d'un coup", async ({ page }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto("/fr");
        await hydrated(page);
        const showcase = page.locator("#showcase");
        await showcase.getByRole("button", { name: "Lancer la démo" }).click();
        await expect(showcase.getByRole("log", { name: "Démo scénarisée" }).locator(".terminal__line")).toHaveCount(5, {
            timeout: 500,
        });
    });

    test("les onglets basculent de panneau", async ({ page }) => {
        await page.goto("/fr");
        await hydrated(page);
        const showcase = page.locator("#showcase");
        await showcase.getByRole("button", { name: "Problèmes" }).click();
        await expect(showcase.getByRole("button", { name: "Problèmes" })).toHaveAttribute("aria-pressed", "true");
        await expect(showcase.getByText("Aucun problème détecté.")).toBeVisible();
    });

    test("en-têtes : encadrement limité à la même origine par défaut", async ({ request }) => {
        const res = await request.get("/");
        expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
        expect(res.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
    });
});
