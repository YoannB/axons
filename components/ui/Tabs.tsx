// components/ui/Tabs.tsx — horizontally scrolling tab strip (generic, no MUI)
"use client";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { AppTabsProps } from "./types";

// Two modes per tab, chosen by `href`:
// - LINK tab (href): a real <a> with aria-current="page" inside a <nav>. The URL is the source
//   of truth, so a direct URL, a reload and back/forward all land on the right tab. This is the
//   accessible pattern for navigation (a role="tablist" would be wrong for page changes).
// - PANEL tab (no href): a <button aria-pressed> calling onSelect (switch a view in place).
// Long labels are truncated (full text in title); the strip scrolls horizontally on small
// screens and keeps the active tab in view.
export function Tabs({ items, activeId, ariaLabel, onSelect, onClose, closeLabel, className }: AppTabsProps) {
    const listRef = useRef<HTMLUListElement>(null);
    const allLinks = items.every((t) => t.href);

    // Bring the active tab into view: a non-destructive DOM sync (scroll position), no state.
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
        el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }, [activeId]);

    const list = (
        <ul ref={listRef} className="tabs__list">
            {items.map((tab) => {
                const active = tab.id === activeId;
                const body = (
                    <>
                        {tab.icon ? <span className="tabs__icon">{tab.icon}</span> : null}
                        <span className="tabs__label">{tab.label}</span>
                    </>
                );
                return (
                    <li key={tab.id} className={cn("tabs__tab", active && "is-active")} data-active={active}>
                        {tab.href ? (
                            <Link
                                href={tab.href}
                                className="tabs__trigger"
                                aria-current={active ? "page" : undefined}
                                title={tab.label}
                            >
                                {body}
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="tabs__trigger"
                                aria-pressed={active}
                                title={tab.label}
                                onClick={() => onSelect?.(tab.id)}
                            >
                                {body}
                            </button>
                        )}
                        {tab.closable && onClose ? (
                            <button
                                type="button"
                                className="tabs__close"
                                aria-label={closeLabel ? closeLabel(tab.label) : `× ${tab.label}`}
                                onClick={() => onClose(tab.id)}
                            >
                                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                                    <path d="M4 4l8 8M12 4l-8 8" />
                                </svg>
                            </button>
                        ) : null}
                    </li>
                );
            })}
        </ul>
    );

    return allLinks ? (
        <nav className={cn("tabs", className)} aria-label={ariaLabel}>
            {list}
        </nav>
    ) : (
        <div className={cn("tabs", className)} role="group" aria-label={ariaLabel}>
            {list}
        </div>
    );
}
