"use client";
import { MaterialProviders } from "@/components/ui/material/MaterialProviders";
import { ToastRegion } from "@/components/ui/ToastRegion";
import type { Consent, ThemeMode } from "@/lib/store";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { AppStateProvider } from "./AppStateProvider";

// Must stay IN SYNC with i18n/request.ts (timeZone). Deliberate double source: the
// NextIntlClientProvider is rendered here, in a Client Component, and the next-intl docs
// (Time zone section) only grant automatic time zone inheritance when rendering from a Server
// Component — which is not the case. So the value is provided explicitly, the
// documented path ("For all other cases, you can specify the value explicitly"). Without this
// prop, every Client Component (e.g. Header, useTranslations("nav")) raises
// ENVIRONMENT_FALLBACK on timeZone, not fatal but visible in the console (browser included).
const TIME_ZONE = "Europe/Paris";

// NEUTRAL root wrapper: the [locale] layout imports NO @mui package directly.
// data-theme is set by useTheme() called in MaterialProviders
// (so no more <ThemeSync/> here: a single, idempotent effect).
export function AppProviders({
    locale,
    messages,
    initialThemeMode,
    initialConsent,
    children,
}: {
    locale: string;
    messages: Record<string, unknown>;
    initialThemeMode: ThemeMode;
    initialConsent: Consent | null;
    children: ReactNode;
}) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
            <AppStateProvider initialThemeMode={initialThemeMode} initialConsent={initialConsent}>
                <MaterialProviders>
                    {children}
                    <ToastRegion />
                </MaterialProviders>
            </AppStateProvider>
        </NextIntlClientProvider>
    );
}
