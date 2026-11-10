"use client";
import { useTranslations } from "next-intl";

// Replaces the limiter in the hero: invites the user to scroll down to the component library.
// Click => handler (user intent), scrollIntoView to the target.
export function ScrollCue({ target = "showcase" }: { target?: string }) {
    const t = useTranslations("hero");
    const go = () => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return (
        <button type="button" className="scroll-cue" onClick={go} aria-label={t("scrollCue")}>
            <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M6 9l6 6 6-6" />
            </svg>
        </button>
    );
}
