"use client";
import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui/types";
import { useTranslations } from "next-intl";

const ITEMS: {
    icon: IconName;
    k: "multilang" | "theme" | "cookies" | "storage" | "security";
}[] = [
    { icon: "globe", k: "multilang" },
    { icon: "palette", k: "theme" },
    { icon: "cookie", k: "cookies" },
    { icon: "box", k: "storage" },
    { icon: "shield", k: "security" },
];

// feature-strip is NO LONGER a .container (it is already inside PageShell's Container): the
// double constraint squashed the 5 items. The fixed-tier grid (see styles/home/feature-strip.css) spreads
// them on one line when there is room, otherwise wraps cleanly.
// ICONS: no 'animated' loop here. At rest the sketch (ghost) is shown, and hovering
// the container (.feature-strip__ico) draws the solid stroke via drawOnce (global CSS),
// consistent with the hero's 4 tech items (same hover policy).
export function FeatureStrip() {
    const t = useTranslations("features");
    return (
        <div className="feature-strip">
            {ITEMS.map((it) => (
                <div key={it.k} className="feature-strip__item">
                    <span className="feature-strip__ico">
                        <Icon name={it.icon} size={20} />
                    </span>
                    <span className="feature-strip__txt">
                        <b>{t(it.k)}</b>
                        <em>{t(`${it.k}Sub`)}</em>
                    </span>
                </div>
            ))}
        </div>
    );
}
