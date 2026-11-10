"use client";
import { Logo } from "@/components/ui";
import { CONSENT_REQUIRED, GITHUB_URL, NAV, SITE_NAME } from "@/constants/site";
import { useCookieConsent } from "@/hooks/use-consent";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function Footer() {
    const t = useTranslations("footer");
    const tn = useTranslations("nav");
    const tc = useTranslations("cookie");
    const { reopen } = useCookieConsent();
    return (
        <footer className="site-footer">
            <div className="container site-footer__grid">
                <div>
                    <Link href="/" className="brand">
                        <Logo size={26} />
                        <span>{SITE_NAME}</span>
                    </Link>
                    <p className="muted">{t("tagline")}</p>
                </div>
                <nav className="site-footer__nav" aria-label="Footer">
                    {NAV.map((n) => (
                        <Link key={n.href} href={n.href as "/"}>
                            {tn(n.key.split(".")[1] as "home")}
                        </Link>
                    ))}
                </nav>
                <div className="site-footer__meta">
                    {/* CNIL: the choice stays revocable from every page. */}
                    {CONSENT_REQUIRED ? (
                        <button type="button" className="site-footer__link-btn" onClick={reopen}>
                            {tc("manage")}
                        </button>
                    ) : null}
                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <span className="muted">{t("rights", { year: new Date().getFullYear(), site: SITE_NAME })}</span>
                </div>
            </div>
        </footer>
    );
}
