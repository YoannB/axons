import { expect, test } from "@playwright/test";

const BENIGN_CONSOLE_PATTERNS = [
    /favicon/i,
    /WebSocket/i,
    /DevTools/i,
    /React DevTools/i,
    /Download the React/i,
    /youtube|ytimg|googleapis|gstatic|doubleclick|googletagmanager/i,
];

function isBenignConsoleError(text: string, url: string): boolean {
    if (BENIGN_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
        return true;
    }

    // Errors coming from uncontrolled external domains are ignored.
    // Application errors must come from localhost in this project.
    if (url && !url.includes("localhost")) {
        return true;
    }

    return false;
}

test.describe("Home — cross-cutting quality", () => {
    test("no application console error on the main page", async ({ page }) => {
        const errors: string[] = [];

        page.on("console", (message) => {
            if (message.type() !== "error") return;

            const text = message.text();
            const url = message.location()?.url ?? "";

            if (isBenignConsoleError(text, url)) return;

            errors.push(text);
        });

        page.on("pageerror", (error) => {
            errors.push(error.message);
        });

        await page.goto("/");
        await page.waitForLoadState("load");

        // Short window to catch deferred hydration / effect errors.
        await page.waitForTimeout(1_000);

        expect(errors).toEqual([]);
    });

    test("no horizontal overflow", async ({ page }) => {
        await page.goto("/");

        const overflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });

        // One-pixel tolerance for sub-pixel rounding.
        expect(overflow).toBeLessThanOrEqual(1);
    });
});
