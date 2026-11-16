import { CookieBanner } from "@/components/layout/CookieBanner";
import { GtmScript } from "@/components/layout/GtmScript";
import { SplashLoader } from "@/components/ui";
import { CLIENT_MESSAGES } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { pickMessages } from "@/lib/client-messages";
import type { Messages } from "@/lib/site-extension";
import { AppProviders } from "@/providers/AppProviders";
import { SiteShell } from "@/site/shell";
import { hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

// Segment layout: validates the locale, loads messages, sets up the providers and the chrome.
// The page FRAME (header, <main>, footer) is the site's `SiteShell` (site/shell.tsx; Axons: DefaultShell).
// <html>/<body> and the beforeInteractive script live in app/layout.tsx (root).
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    // Client Components only get the namespaces they read (i18n/client-messages.ts); Server
    // Components keep the full catalogue through getTranslations.
    const messages = pickMessages((await getMessages({ locale })) as Messages, CLIENT_MESSAGES);

    return (
        <AppProviders locale={locale} messages={messages} initialThemeMode="system" initialConsent={null}>
            <SiteShell locale={locale}>{children}</SiteShell>
            <CookieBanner />
            <GtmScript />
            {/* SplashLoader hides #app-splash (rendered by the root) via .is-leaving: non-destructive
          CSS mutation, never el.remove() (which would corrupt hydration). */}
            <SplashLoader />
        </AppProviders>
    );
}
