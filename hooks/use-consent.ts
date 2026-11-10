"use client";
import { COOKIE_CONSENT, getCookie, setCookie } from "@/lib/cookies";
import type { Consent } from "@/lib/store";
import { useConsent, useStore } from "./use-store";

export function useCookieConsent() {
    const store = useStore();
    const consent = useConsent();
    const decide = (analytics: boolean, ads: boolean) => {
        // handler (user intent)
        const c: Consent = { necessary: true, analytics, ads };
        store.setConsent(c);
        setCookie(COOKIE_CONSENT, JSON.stringify(c));
        document.documentElement.classList.toggle("has-consent", true);
    };
    return {
        consent,
        acceptAll: () => decide(true, true),
        refuseAll: () => decide(false, false),
        readInitial: (): Consent | null => {
            try {
                return getCookie(COOKIE_CONSENT) ? JSON.parse(getCookie(COOKIE_CONSENT)!) : null;
            } catch {
                return null;
            }
        },
    };
}
