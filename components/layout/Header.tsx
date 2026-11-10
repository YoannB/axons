"use client";
import { LanguageSwitcher, LimitBadge, Logo, ThemeToggle } from "@/components/ui";
import { GITHUB_URL, NAV, SITE_NAME } from "@/constants/site";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { useTranslations } from "next-intl";
import { useState } from "react";

// DOM order: burger (1st, on the left on mobile, display:none on desktop), brand, nav,
// tools. The tools are pushed to the right by margin-left:auto (CSS), without an auto margin on
// the brand, which would override the nav's flex:1 on desktop.
export function Header() {
    const t = useTranslations("nav");
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <header className="site-header">
            <div className="site-header__inner container">
                <button
                    type="button"
                    className={cn("menu-toggle", open && "is-open")}
                    aria-label={t("menu")}
                    aria-expanded={open}
                    aria-controls="site-nav"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                <Link href="/" className="brand" aria-label={SITE_NAME} onClick={close}>
                    <Logo size={30} />
                    <span>
                        {SITE_NAME[0]}
                        <b>{SITE_NAME.slice(1)}</b>
                    </span>
                </Link>

                <nav id="site-nav" className={cn("site-nav", open && "is-open")} aria-label="Main">
                    {NAV.map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className={cn("site-nav__link", pathname === n.href && "is-active")}
                            onClick={close}
                        >
                            {t(n.key.split(".")[1])}
                        </Link>
                    ))}
                </nav>

                <div className="site-header__tools">
                    <LimitBadge className="limit-badge--header" />
                    <a className="gh-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
