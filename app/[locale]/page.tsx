import { Faq } from "@/components/home/Faq";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { LatestArticles } from "@/components/home/LatestArticles";
import { SeoResources } from "@/components/home/SeoResources";
import { ValueProps } from "@/components/home/ValueProps";
import { PageShell } from "@/components/layout/PageShell";

// Static Server Component. The interactive children are Client Components that read the
// locale through the NextIntlClientProvider set in the layout; only LatestArticles (server)
// receives the `locale` param. No request read here, so the route stays prerendered by the
// layout's generateStaticParams.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <PageShell>
            <Hero />
            <LatestArticles locale={locale} />
            <SeoResources />
            <ValueProps />
            <FeatureStrip />
            <Faq />
        </PageShell>
    );
}
