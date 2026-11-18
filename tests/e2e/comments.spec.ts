import { expect, test, type Page } from "@playwright/test";
import { COMMENTS, COMMENTS_ENABLED } from "../../constants/site";
import { blockDisqus } from "./support/disqus";
import { cookieBanner } from "./support/home";
import { lp } from "./support/locale-path";

// Comments under collection entries (docs/articles.md → Comments). Needs a build that saw a
// shortname: CI sets a FAKE NEXT_PUBLIC_DISQUS_SHORTNAME, and every request to Disqus is
// intercepted and aborted (support/disqus.ts), so the specs check what the page TRIES to load.
// Relies on Axons' demo articles: `writing-articles` (live) and `archived-entries` (archived).

const ENTRY = lp("fr", "/articles/ecrire-un-article");
const OTHER_ENTRY = lp("fr", "/articles/visite-de-l-architecture");
const ARCHIVED = lp("fr", "/articles/conserver-les-anciennes-entrees");

async function open(page: Page, path: string) {
    await page.goto(path);
    await expect(page.locator("#app-splash")).toHaveClass(/is-leaving/);
}

const embedUrl = () => `https://${COMMENTS?.shortname}.disqus.com/embed.js`;

test.describe("Comments (Disqus)", () => {
    test.skip(!COMMENTS_ENABLED, "comments off (no SITE.comments, no shortname or no collection with comments)");

    test("the cookie banner offers the comments purpose", async ({ page }) => {
        await blockDisqus(page);
        await open(page, ENTRY);
        await expect(cookieBanner(page).locator('[data-purpose="comments"]')).toContainText("Disqus");
    });

    test("non-archived entry: placeholder, nothing from Disqus before the click, a load attempt after", async ({
        page,
    }) => {
        const attempts = await blockDisqus(page);
        await open(page, ENTRY);
        const comments = page.locator("[data-entry-comments]");
        await expect(comments.getByRole("heading", { name: "Commentaires" })).toBeVisible();
        await expect(comments.locator("[data-comments-gate]")).toContainText("Disqus");
        // Refusing in the banner never blocks reading, and still loads nothing.
        await cookieBanner(page).getByRole("button", { name: "Refuser" }).click();
        await expect(cookieBanner(page)).toBeHidden();
        await page.waitForLoadState("networkidle");
        expect(attempts).toEqual([]);
        await expect(page.locator(".article-body")).toBeVisible();

        await comments.getByRole("button", { name: "Afficher les commentaires", exact: true }).click();
        await expect(comments.locator("[data-comments-gate]")).toHaveCount(0);
        await expect.poll(() => attempts).toContain(embedUrl());
        // This page only: the next entry asks again.
        await open(page, OTHER_ENTRY);
        await expect(page.locator("[data-comments-gate]")).toBeVisible();
    });

    test("an archived entry has no comments at all", async ({ page }) => {
        const attempts = await blockDisqus(page);
        await open(page, ARCHIVED);
        await expect(page.locator(".article__archive-notice")).toBeVisible();
        await expect(page.locator("[data-entry-comments]")).toHaveCount(0);
        await page.waitForLoadState("networkidle");
        expect(attempts).toEqual([]);
    });

    test("consent given in the banner loads the comments without a click", async ({ page }) => {
        const attempts = await blockDisqus(page);
        await open(page, ENTRY);
        await page.waitForLoadState("networkidle");
        expect(attempts).toEqual([]);
        await cookieBanner(page).getByRole("button", { name: "Accepter" }).click();
        await expect.poll(() => attempts).toContain(embedUrl());
        await expect(page.locator("[data-comments-gate]")).toHaveCount(0);
    });

    test('"Always show comments" grants the purpose for the next entries', async ({ page }) => {
        const attempts = await blockDisqus(page);
        await open(page, ENTRY);
        // Other purposes refused first: granting comments keeps that refusal.
        await cookieBanner(page).getByRole("button", { name: "Refuser" }).click();
        await page.getByRole("button", { name: "Toujours afficher les commentaires" }).click();
        await expect.poll(() => attempts).toContain(embedUrl());
        const cookies = await page.context().cookies();
        const consent = JSON.parse(decodeURIComponent(cookies.find((c) => c.name === "axons-consent")!.value));
        expect(consent).toMatchObject({ analytics: false, ads: false, comments: true });
        attempts.length = 0;
        await open(page, OTHER_ENTRY);
        await expect(page.locator("[data-comments-gate]")).toHaveCount(0);
        await expect.poll(() => attempts).toContain(embedUrl());
    });
});
