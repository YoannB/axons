"use client";
import { Button, Icon, ScrollCue } from "@/components/ui";
import { useTranslations } from "next-intl";
import { ComponentShowcase } from "./ComponentShowcase";
import { HeroRoulette } from "./HeroRoulette";

// hero__grid is NO LONGER a .container: the page is already wrapped in PageShell's
// Container. A double .container (max-width + padding applied twice) squashed the
// available width -> hero/feature-strip too narrow. A single container layer.
export function Hero() {
    const t = useTranslations("hero");
    const rotating = t.raw("rotating") as string[];
    const techs = [
        { icon: "code" as const, k: "next", s: "nextSub" },
        { icon: "box" as const, k: "ts", s: "tsSub" },
        { icon: "palette" as const, k: "mui", s: "muiSub" },
        { icon: "sparkles" as const, k: "or", s: "orSub" },
    ];
    return (
        <section className="hero">
            <div className="hero__grid">
                <div className="hero__copy">
                    <span className="pill">
                        <Icon name="sparkles" size={15} animated /> {t("badge")}
                    </span>
                    <h1 className="hero__title">
                        {t("titleLead")} <HeroRoulette words={rotating} />
                    </h1>
                    <p className="hero__sub">{t("subtitle")}</p>
                    <ul className="hero__tech">
                        {techs.map((x) => (
                            <li key={x.k}>
                                <span className="hero__tech-ico">
                                    <Icon name={x.icon} size={18} />
                                </span>
                                <span>
                                    <b>{t(`tech.${x.k}`)}</b>
                                    <em>{t(`tech.${x.s}`)}</em>
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="hero__cta">
                        <Button
                            variant="primary"
                            size="lg"
                            iconRight={<Icon name="rocket" size={16} />}
                            onClick={() => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            {t("ctaDemo")}
                        </Button>
                        <Button variant="secondary" size="lg" href="/sitemap">
                            {t("ctaPlan")}
                        </Button>
                    </div>
                    <ScrollCue />
                </div>
                <div className="hero__demo">
                    <ComponentShowcase />
                </div>
            </div>
        </section>
    );
}
