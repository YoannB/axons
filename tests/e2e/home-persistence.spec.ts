import { expect, test } from "@playwright/test";
import { acceptCookiesButton, cookieBanner, themeToggle } from "./support/home";

test.describe("Home — client persistence", () => {
    test("cookie consent persists after reload", async ({ page }) => {
        await page.goto("/");

        const banner = cookieBanner(page);
        await expect(banner).toBeVisible();

        await acceptCookiesButton(page).click();
        await expect(banner).toBeHidden();

        await page.reload();

        await expect(cookieBanner(page)).toBeHidden();
    });

    test("theme persists after reload", async ({ page }) => {
        await page.goto("/");

        await themeToggle(page).click();

        const after = await page.getAttribute("html", "data-theme");
        expect(after).toBeTruthy();

        await page.reload();

        await expect
            .poll(async () => page.getAttribute("html", "data-theme"), {
                timeout: 5_000,
            })
            .toBe(after);
    });
});
