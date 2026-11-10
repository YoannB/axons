"use client";
import { LOCALES, type LocaleCode } from "@/constants/site";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import { switchTarget } from "@/lib/locale-switch";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

// Type derived from routing: matches exactly what `replace` expects as its `locale` option,
// whether or not next-intl preserves the `routing.locales` literals. Single source of truth.
type ActiveLocale = (typeof routing.locales)[number];

// Locale switch: `pathname` (logical key, from next-intl's usePathname) as
// 1st argument; `locale` + `scroll` as 2nd argument (options). NEVER put `locale`
// in the `to` object: its type only includes { pathname, query? } (see TS error 2353).
export function LanguageSwitcher() {
    const locale = useLocale();
    const t = useTranslations("showcase");
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    // Only the SERVED locales (NEXT_PUBLIC_LOCALES) are offered.
    const served = LOCALES.filter((l) => l.active);
    const current = served.find((l) => l.code === locale) ?? served[0];

    // Close on outside click: DOM subscription (external system) => legitimate effect.
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    const switchTo = (code: LocaleCode) => {
        setOpen(false);
        // Runtime guard: only served locales are listed, this also protects against a future change.
        if (!(routing.locales as readonly string[]).includes(code)) return;
        // A dynamic route (translated article slug) takes its param from the page's hreflang
        // alternate for `code`, read at click time from <head> (lib/locale-switch.ts).
        const alternate = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${code}"]`);
        const target = switchTarget(pathname, alternate?.href ?? null);
        router.replace(target as Parameters<typeof router.replace>[0], { locale: code as ActiveLocale, scroll: false });
    };

    return (
        <div className="lang" ref={ref}>
            <button
                type="button"
                className="lang__btn"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t("langLabel")}
                onClick={() => setOpen((o) => !o)}
            >
                <span className="lang__flag">{current.flag}</span>
                <span>{current.code.toUpperCase()}</span>
                <span className="lang__caret" aria-hidden="true">
                    ▾
                </span>
            </button>
            {open && (
                <ul className="lang__menu" role="listbox">
                    {served.map((l) => (
                        <li key={l.code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={l.code === locale}
                                className={cn("lang__opt", l.code === locale && "is-active")}
                                onClick={() => switchTo(l.code)}
                            >
                                <span>{l.flag}</span>
                                <span>{l.native}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
