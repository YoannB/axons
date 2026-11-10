import { Card } from "@/components/ui";
import type { AppLocale } from "@/i18n/locales";
import { Link } from "@/i18n/routing";

export interface ArticleTeaserProps {
    title: string;
    description: string;
    slug: string;
    // Locale of the translation shown: the link goes to THAT translation's own URL.
    locale: AppLocale;
    date: string;
    dateLabel: string;
    image?: string;
    // Set when the visited locale has no translation (fallback): language of the original.
    fallback?: { flag: string; label: string; title: string };
    headingLevel?: "h2" | "h3";
}

// Internal article preview (listing + "latest articles" block). Server-compatible: no hook,
// every label arrives pre-formatted. Reuses the .article-card look of the SEO resources.
export function ArticleTeaser({
    title,
    description,
    slug,
    locale,
    date,
    dateLabel,
    image,
    fallback,
    headingLevel: Heading = "h2",
}: ArticleTeaserProps) {
    const href = { pathname: "/articles/[slug]", params: { slug } } as const;
    return (
        <Card as="article" className="article-card article-teaser">
            <Link href={href} locale={locale} className="article-card__thumb" tabIndex={-1} aria-hidden="true">
                {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static public asset of unknown size
                    <img src={image} alt="" className="article-card__img" loading="lazy" />
                ) : (
                    <span className="article-card__mark">
                        {title
                            .replace(/[^\p{L}\p{N}]/gu, "")
                            .slice(0, 2)
                            .toUpperCase()}
                    </span>
                )}
            </Link>
            <div className="article-card__body">
                {/* lang/hrefLang only on a fallback: the title and summary are in another language. */}
                <Heading className="article-teaser__title" lang={fallback ? locale : undefined}>
                    <Link href={href} locale={locale} hrefLang={fallback ? locale : undefined}>
                        {title}
                    </Link>
                </Heading>
                <p className="muted" lang={fallback ? locale : undefined}>
                    {description}
                </p>
                <div className="article-card__meta">
                    <time className="dur" dateTime={date}>
                        {dateLabel}
                    </time>
                    {fallback ? (
                        <span className="article-teaser__lang" title={fallback.title}>
                            <span aria-hidden="true">{fallback.flag}</span> {fallback.label}
                        </span>
                    ) : null}
                </div>
            </div>
        </Card>
    );
}
