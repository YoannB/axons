import { StaticPage } from "@/components/content/StaticPage";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

type Section = { heading: string; body: string[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.cookies" });
    return pageMetadata({
        title: t("title"),
        description: t("intro").slice(0, 150),
        href: "/cookies",
        locale,
    });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.cookies" });
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
