"use client";
import { LOCALES, type LocaleCode } from "@/constants/site";
import { routing, usePathname, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/cn";
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
    const tc = useTranslations("common");
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[1];

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
        // Runtime guard: inactive languages (active: false in constants/site.ts) may be missing from routing.locales.
        // The button's `disabled` already protects the UX; this guard also protects against a future removal.
        if (!(routing.locales as readonly string[]).includes(code)) return;
        router.replace({ pathname }, { locale: code as ActiveLocale, scroll: false });
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
                    {LOCALES.map((l) => (
                        <li key={l.code}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={l.code === locale}
                                disabled={!l.active}
                                className={cn("lang__opt", l.code === locale && "is-active")}
                                onClick={() => switchTo(l.code)}
                            >
                                <span>{l.flag}</span>
                                <span>{l.native}</span>
                                {!l.active && <em className="lang__soon">{tc("soon")}</em>}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
