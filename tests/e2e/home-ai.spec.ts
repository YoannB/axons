import { expect, test } from "@playwright/test";
import { aiButton, firstToast, mockHello, mockHelloSequence, mockHelloWithCounter, toastByText } from "./support/ai";
import { usageCount } from "./support/storage";

test.describe("Home — AI call (client boundary)", () => {
    test("useful reply: pending guard, success toast, credit consumed", async ({ page }) => {
        const counter = await mockHelloWithCounter(page, {
            delayMs: 400,
            body: { text: "E2E useful reply" },
        });

        await page.goto("/");

        const btn = aiButton(page);

        await expect(btn).toBeEnabled();

        await btn.click();

        await expect(btn).toBeDisabled();

        await expect(toastByText(page, "E2E useful reply")).toBeVisible();

        await expect(btn).toBeEnabled();

        expect(counter.hits).toBe(1);
        expect(await usageCount(page)).toBe(1);
    });

    test("HTTP error: error toast, button re-enabled, credit not consumed", async ({ page }) => {
        await mockHello(page, {
            status: 500,
            body: {
                error: {
                    code: "provider",
                    message: "provider",
                },
            },
        });

        await page.goto("/");

        const btn = aiButton(page);

        await btn.click();

        await expect(firstToast(page)).toBeVisible();
        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBeNull();
    });

    test("empty 200 reply: error toast, credit not consumed", async ({ page }) => {
        await mockHello(page, {
            body: { text: "" },
        });

        await page.goto("/");

        const btn = aiButton(page);

        await btn.click();

        await expect(firstToast(page)).toBeVisible();
        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBeNull();
    });

    test("200 reply without text field: error toast, credit not consumed", async ({ page }) => {
        await mockHello(page, {
            body: {},
        });

        await page.goto("/");

        const btn = aiButton(page);

        await btn.click();

        await expect(firstToast(page)).toBeVisible();
        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBeNull();
    });

    test("rate limit error: error toast, credit not consumed", async ({ page }) => {
        await mockHello(page, {
            status: 429,
            body: {
                error: {
                    code: "rate",
                    message: "quota",
                },
            },
        });

        await page.goto("/");

        const btn = aiButton(page);

        await btn.click();

        await expect(firstToast(page)).toBeVisible();
        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBeNull();
    });

    test("credit consumed only on a useful reply: error then success", async ({ page }) => {
        await mockHelloSequence(page, [
            {
                status: 429,
                body: {
                    error: {
                        code: "rate",
                        message: "quota",
                    },
                },
            },
            {
                body: { text: "E2E second reply useful" },
            },
        ]);

        await page.goto("/");

        const btn = aiButton(page);

        await btn.click();

        await expect(firstToast(page)).toBeVisible();
        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBeNull();

        await btn.click();

        await expect(toastByText(page, "E2E second reply useful")).toBeVisible();

        await expect(btn).toBeEnabled();

        expect(await usageCount(page)).toBe(1);
    });
});
