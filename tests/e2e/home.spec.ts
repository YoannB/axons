import { expect, test } from "@playwright/test";
import { acceptCookiesButton, cookieBanner, languageButton, languageOption, themeToggle } from "./support/home";

test.describe("Home — smoke structurel", () => {
    test("affiche le hero, la bibliothèque de composants, la section SEO et la FAQ", async ({ page }) => {
        await page.goto("/");

        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator("#showcase")).toBeVisible();
        await expect(page.locator("#seo")).toBeVisible();
        await expect(page.locator("#faq")).toBeVisible();
    });

    test("le bandeau cookies apparaît puis se masque après acceptation", async ({ page }) => {
        await page.goto("/");

        const banner = cookieBanner(page);
        await expect(banner).toBeVisible();

        await acceptCookiesButton(page).click();

        await expect(banner).toBeHidden();
    });

    test("bascule de langue FR ↔ EN conserve la page courante", async ({ page }) => {
        await page.goto("/");

        await languageButton(page).click();
        await languageOption(page, "Français").click();

        await expect(page).toHaveURL(/\/fr/);

        await languageButton(page).click();
        await languageOption(page, "English").click();

        await expect(page).toHaveURL(/^(?!.*\/fr)/);
    });

    test("le toggle de thème pose data-theme sur <html>", async ({ page }) => {
        await page.goto("/");

        const before = await page.getAttribute("html", "data-theme");

        await themeToggle(page).click();

        const after = await page.getAttribute("html", "data-theme");

        expect(after).not.toBe(before);
        expect(["light", "dark"]).toContain(after);
    });
});
