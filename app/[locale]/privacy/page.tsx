import { StaticPage } from "@/components/content/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

type Section = { heading: string; body: string[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.privacy" });
    return pageMetadata({
        title: t("title"),
        description: t("intro").slice(0, 150),
        href: "/privacy",
    });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.privacy" });
    const ts = await getTranslations({ locale, namespace: "showcase" });
    const sections = t.raw("sections") as Section[];
    return (
        <StaticPage
            title={t("title")}
            intro={t("intro")}
            crumbs={[{ label: ts("bcHome"), href: "/" }, { label: t("title") }]}
            body={
                <>
                    {sections.map((s, i) => (
                        <section key={i} className="static-page__section">
                            <h2>{s.heading}</h2>
                            {s.body.map((p, j) => (
                                <p key={j}>{p}</p>
                            ))}
                        </section>
                    ))}
                </>
            }
        />
    );
}
