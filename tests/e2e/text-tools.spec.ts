import { expect, test, type Page } from "@playwright/test";

// Generic text-tool kit demo (components/home/TextToolsShowcase): no AI call, the diff is
// computed in the browser. Forced /fr so the asserted labels are exact.
function section(page: Page) {
    return page.locator("#text-tools");
}
function source(page: Page) {
    return section(page).locator("#text-tools-source");
}
// Named: the cookie banner is a role=dialog too.
function confirmDialog(page: Page) {
    return page.getByRole("dialog", { name: "Abandonner votre texte ?" });
}
// Typing before the Textarea hydrates is merged with the SSR value; retry until it sticks.
async function typeInSource(page: Page, text: string) {
    await expect(async () => {
        await source(page).fill(text);
        await expect(source(page)).toHaveValue(text, { timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
}
function chip(page: Page, name: string) {
    return section(page).getByRole("radio", { name });
}

test.describe("Outils texte — démo générique", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/fr");
        await expect(section(page)).toBeVisible();
        // Layout hydrated (SplashLoader's effect). The page chunk may still hydrate a bit
        // later, hence typeInSource() below.
        await expect(page.locator("#app-splash")).toHaveClass(/is-leaving/);
    });

    test("le premier exemple est chargé et ses corrections sont surlignées", async ({ page }) => {
        await expect(chip(page, "Fautes de frappe")).toHaveAttribute("aria-checked", "true");
        await expect(source(page)).toHaveValue(/vos retour,/);
        await expect(section(page).locator(".diff-view mark.diff--replace")).toHaveCount(3);
        await expect(section(page).locator(".field-count")).toHaveText(/\d+ \/ 500/);
    });

    test("changer d'exemple sans modification ne demande pas de confirmation", async ({ page }) => {
        await chip(page, "Ponctuation").click();
        await expect(chip(page, "Ponctuation")).toHaveAttribute("aria-checked", "true");
        await expect(source(page)).toHaveValue(/^Bonjour Marie je reviens/);
        await expect(section(page).locator(".diff-view ins.diff--insert").first()).toBeVisible();
        await expect(confirmDialog(page)).toHaveCount(0);
    });

    test("un texte modifié est protégé par une confirmation", async ({ page }) => {
        await typeInSource(page, "Mon propre texte");
        await chip(page, "Ponctuation").click();

        const dialog = confirmDialog(page);
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Continuer l'édition" }).click();
        await expect(dialog).toBeHidden();
        await expect(source(page)).toHaveValue("Mon propre texte");

        await chip(page, "Ponctuation").click();
        await confirmDialog(page).getByRole("button", { name: "Abandonner" }).click();
        await expect(source(page)).toHaveValue(/^Bonjour Marie je reviens/);
    });

    test("réinitialiser vide le texte et affiche le placeholder du résultat", async ({ page }) => {
        await section(page).getByRole("button", { name: "Réinitialiser" }).click();
        await expect(source(page)).toHaveValue("");
        await expect(section(page).locator(".diff-view__placeholder")).toBeVisible();
        await expect(section(page).getByRole("radio", { checked: true })).toHaveCount(0);
    });
});
