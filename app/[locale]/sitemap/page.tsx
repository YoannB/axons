import { StaticPage } from "@/components/content/StaticPage";
import { Card } from "@/components/ui";
import { NAV } from "@/constants/site";
import { Link } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "pages.sitemap" });
    return pageMetadata({
        title: t("title"),
        description: t("intro"),
        href: "/sitemap",
    });
}

export default async function SitemapPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const tp = await getTranslations({ locale, namespace: "pages.sitemap" });
    const tn = await getTranslations({ locale, namespace: "nav" });
    const ts = await getTranslations({ locale, namespace: "showcase" });

    return (
        <StaticPage
            title={tp("title")}
            intro={tp("intro")}
            crumbs={[{ label: ts("bcHome"), href: "/" }, { label: tp("title") }]}
            body={
                <Card>
                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "grid",
                            gap: 8,
                        }}
                    >
                        {NAV.map((n) => (
                            <li key={n.href}>
                                <Link href={n.href} style={{ color: "var(--accent-2)" }}>
                                    {tn(n.key.split(".")[1])}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
            }
        />
    );
}
