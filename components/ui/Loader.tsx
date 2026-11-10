"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Logo } from "./Logo";

// Pre-hydration splash: the <div id="app-splash"> is rendered by the SERVER layout,
// so it BELONGS to the React tree. It is NEVER removed from the DOM (el.remove()
// would corrupt reconciliation -> NotFoundError insertBefore/removeChild on <div>).
// It is only hidden through the .is-leaving class (opacity + visibility + pointer-events),
// the node staying in place but inert and out of the flow (position:fixed). This is idempotent,
// so no cleanup is needed.
export function SplashLoader() {
    useEffect(() => {
        document.getElementById("app-splash")?.classList.add("is-leaving");
    }, []);
    return null;
}

// NEUTRAL public props of the transition loader. Defaults = historical behavior
// (56px Logo + bar + text), so every existing call stays identical.
// To expose these types globally, move them to components/ui/types.ts
// (AppLoaderProps); kept here so as not to widen types.ts without a need.
export interface LoaderProps {
    /** Logo (site icon) size in px. Default 56. */
    size?: number;
    /** Show the Logo. Default true. */
    showIcon?: boolean;
    /** Show the animated progress bar. Default true. */
    showBar?: boolean;
    /** Show the localized label. Default true. */
    showText?: boolean;
}

// Transition loader (AI calls, Suspense): purely declarative, no DOM mutation.
// Constant aria-label => the role="status" announcement survives even with showText={false}
// ("icon only" / "progress only" variants), without depending on the visual text.
export function Loader({ size = 56, showIcon = true, showBar = true, showText = true }: LoaderProps) {
    const t = useTranslations("common");
    return (
        <div className="loader" role="status" aria-live="polite" aria-label={t("loading")}>
            {showIcon && <Logo size={size} />}
            {showBar && <div className="loader__bar" />}
            {showText && <span className="loader__text">{t("loading")}</span>}
        </div>
    );
}
