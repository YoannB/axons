"use client";
import { Button } from "@/components/ui";
import { useCookieConsent } from "@/hooks/use-consent";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// Rendering depends on consent (client snapshot). The inline <head> script
// already sets .has-consent on <html> for returning visitors → no flash/CLS.
export function CookieBanner() {
    const { consent, acceptAll, refuseAll } = useCookieConsent();
    const t = useTranslations("cookie");
    if (consent) return null;
    return (
        <aside className="cookie-banner" data-cookie-banner role="dialog" aria-label={t("message")}>
            <div className="cookie-banner__ico">🍪</div>
            <div className="cookie-banner__body">
                <p>{t("message")}</p>
                <div className="cookie-banner__actions">
                    <Button variant="primary" size="sm" onClick={acceptAll}>
                        {t("accept")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={refuseAll}>
                        {t("refuse")}
                    </Button>
                    <Link href="/cookies" className="cookie-banner__link">
                        {t("link")}
                    </Link>
                </div>
            </div>
        </aside>
    );
}
