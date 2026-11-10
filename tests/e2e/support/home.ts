import type { Page } from "@playwright/test";

export function header(page: Page) {
    return page.getByRole("banner");
}

export function cookieBanner(page: Page) {
    return page.locator("[data-cookie-banner]");
}

export function acceptCookiesButton(page: Page) {
    return cookieBanner(page).getByRole("button", { name: /Accept/i });
}

export function themeToggle(page: Page) {
    return header(page).locator(".theme-toggle");
}

export function languageButton(page: Page) {
    return header(page).locator(".lang__btn");
}

export function languageOption(page: Page, name: string) {
    return header(page).locator(".lang__opt", { hasText: name });
}
