import { Faq } from "@/components/home/Faq";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { LatestArticles } from "@/components/home/LatestArticles";
import { SeoResources } from "@/components/home/SeoResources";
import { ValueProps } from "@/components/home/ValueProps";
import { PageShell } from "@/components/layout/PageShell";
import type { SiteHomeProps } from "@/lib/site-extension";

// Axons' home body, rendered by app/[locale]/page.tsx through `SiteHome` (site/home.tsx), which
// re-exports it unless a derived site replaces it (docs/architecture.md → Deriving a site).
// Static Server Component. The interactive children are Client Components that read the
// locale through the NextIntlClientProvider set in the layout; only LatestArticles (server)
// receives the `locale` param.
export function AxonsHome({ locale }: SiteHomeProps) {
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
