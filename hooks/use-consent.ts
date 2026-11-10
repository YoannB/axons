"use client";
import { COOKIE_CONSENT, getCookie, setCookie } from "@/lib/cookies";
import type { Consent } from "@/lib/store";
import { useConsent, useConsentPromptOpen, useStore } from "./use-store";

// Consent is decided in event handlers only (user intent). CNIL: refusing must be as easy as
// accepting, and the choice must stay revocable from every page (footer "Manage cookies").
export function useCookieConsent() {
    const store = useStore();
    const consent = useConsent();
    const promptOpen = useConsentPromptOpen();
    const decide = (analytics: boolean, ads: boolean) => {
        const previous = consent;
        const c: Consent = { necessary: true, analytics, ads };
        store.setConsent(c);
        setCookie(COOKIE_CONSENT, JSON.stringify(c));
        document.documentElement.classList.toggle("has-consent", true);
        // A tracker already injected (GTM) cannot be unloaded: withdrawing a previous "yes"
        // reloads the page so the new choice applies to a clean document.
        if ((previous?.analytics && !analytics) || (previous?.ads && !ads)) window.location.reload();
    };
    return {
        consent,
        acceptAll: () => decide(true, true),
        refuseAll: () => decide(false, false),
        // The banner shows when no choice exists yet OR the visitor re-opened it.
        bannerOpen: !consent || promptOpen,
        // Re-opens the banner: the stored choice stays in effect until a new one is made, so
        // nothing is loaded or withdrawn by simply opening it (the class only hides the banner).
        reopen: () => {
            document.documentElement.classList.remove("has-consent");
            store.reopenConsent();
        },
        readInitial: (): Consent | null => {
            try {
                return getCookie(COOKIE_CONSENT) ? JSON.parse(getCookie(COOKIE_CONSENT)!) : null;
            } catch {
                return null;
            }
        },
    };
}
