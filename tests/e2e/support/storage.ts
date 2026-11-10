import type { Page } from "@playwright/test";
import { LS_USAGE } from "../../../lib/storage";

export async function readRawUsage(page: Page): Promise<string | null> {
    return page.evaluate((key) => localStorage.getItem(key), LS_USAGE);
}

export async function usageCount(page: Page): Promise<number | null> {
    const raw = await readRawUsage(page);

    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as { count?: unknown };

        return typeof parsed.count === "number" ? parsed.count : null;
    } catch {
        return null;
    }
}

export async function clearUsage(page: Page): Promise<void> {
    await page.evaluate((key) => localStorage.removeItem(key), LS_USAGE);
}
