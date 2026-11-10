import { StaticPage } from "@/components/content/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

// Shape of the rich content (see messages/<locale>.json -> pages.legal.sections).
// Documented cast on t.raw: the JSON is internal and controlled, no placeholder
// appears in it, so there is no risk of a missing substitution.
type Section = { heading: string; body: string[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.legal" });
    // description = intro (the old "body" key no longer exists in the JSON).
    return pageMetadata({
        title: t("title"),
        description: t("intro").slice(0, 150),
        href: "/legal",
    });
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.legal" });
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
