"use client";
import { Button, Card, Icon } from "@/components/ui";
import { AI_ENABLED, SITE_NAME } from "@/constants/site";
import { useAiCall } from "@/hooks/use-ai-call";
import { useTranslations } from "next-intl";

// The CTA is wrapped in a neutral centered container (no MUI class is targeted
// in styles/home/value-props.css: the adapter boundary forbids it).
export function ValueProps() {
    const t = useTranslations("seo");
    const { call, pending, canCall } = useAiCall();
    const why = t.raw("why") as string[];
    return (
        <Card className="valueprops">
            <h3>
                <Icon name="rocket" size={20} /> {t("articlesTitle", { site: SITE_NAME })}
            </h3>
            <ul className="valueprops__list">
                {why.map((w, i) => (
                    <li key={i}>
                        <Icon name="check" size={16} /> {w}
                    </li>
                ))}
            </ul>
            {/* AI call-to-action: absent when the AI layer is off (no key / limit 0). */}
            {AI_ENABLED ? (
                <div className="valueprops__cta">
                    <h4>{t("ctaTitle")}</h4>
                    <p className="muted">{t("ctaText")}</p>
                    <div className="valueprops__cta-actions">
                        <Button
                            variant="primary"
                            loading={pending}
                            disabled={!canCall}
                            onClick={() => call()}
                            iconLeft={<Icon name="sparkles" size={16} animated />}
                        >
                            {t("ctaButton")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </Card>
    );
}
