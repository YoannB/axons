import { Faq } from "@/components/home/Faq";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { LatestArticles } from "@/components/home/LatestArticles";
import { SeoResources } from "@/components/home/SeoResources";
import { ValueProps } from "@/components/home/ValueProps";
import { PageShell } from "@/components/layout/PageShell";

// The home body, rendered by app/[locale]/page.tsx (which keeps the `meta.home` metadata).
// Static Server Component. The interactive children are Client Components that read the
// locale through the NextIntlClientProvider set in the layout; only LatestArticles (server)
// receives the `locale` param.
export function Home({ locale }: { locale: string }) {
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
