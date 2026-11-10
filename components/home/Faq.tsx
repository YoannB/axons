"use client";
import { Icon, Section } from "@/components/ui";
import { useTranslations } from "next-intl";

export function Faq() {
    const t = useTranslations("faq");
    const items = t.raw("items") as { q: string; a: string }[];
    return (
        <Section
            id="faq"
            title={
                <>
                    <Icon name="sparkles" size={20} /> {t("title")}
                </>
            }
            className="faq"
        >
            <div className="faq__list">
                {items.map((it, i) => (
                    <details key={i} className="faq__item" open={i === 0}>
                        <summary className="faq__q">{it.q}</summary>
                        <p className="faq__a muted">{it.a}</p>
                    </details>
                ))}
            </div>
        </Section>
    );
}
