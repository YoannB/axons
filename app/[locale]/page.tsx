import { Faq } from "@/components/home/Faq";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { SeoResources } from "@/components/home/SeoResources";
import { TextToolsShowcase } from "@/components/home/TextToolsShowcase";
import { ValueProps } from "@/components/home/ValueProps";
import { PageShell } from "@/components/layout/PageShell";

// Static Server Component. It reads NO server locale API: the interactive
// children are Client Components that read the locale through the
// NextIntlClientProvider set in the layout. No request read here,
// so the route stays prerendered by the layout's generateStaticParams.
export default function HomePage() {
    return (
        <PageShell>
            <Hero />
            <TextToolsShowcase />
            <SeoResources />
            <ValueProps />
            <FeatureStrip />
            <Faq />
        </PageShell>
    );
}
