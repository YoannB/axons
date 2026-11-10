import { ArticleTeaser } from "@/components/content/ArticleTeaser";
import { LOCALES } from "@/constants/site";
import type { AppLocale } from "@/i18n/locales";
import type { ListedArticle } from "@/lib/articles/parse";
import { getFormatter, getTranslations } from "next-intl/server";

// Server Component: list of article teasers for `locale` (listing page and home block).
// Dates are formatted by next-intl in UTC: a front-matter date is a calendar day, not an instant.
export async function ArticleFeed({
    items,
    locale,
    headingLevel,
}: {
    items: ListedArticle[];
    locale: string;
    headingLevel?: "h2" | "h3";
}) {
    const format = await getFormatter({ locale });
    const t = await getTranslations({ locale, namespace: "pages.articles" });
    return (
        <div className="article-feed">
            {items.map(({ article, isFallback }) => {
                const meta = LOCALES.find((l) => l.code === article.locale);
                const dateLabel = t("publishedOn", {
                    date: format.dateTime(new Date(`${article.date}T00:00:00Z`), {
                        dateStyle: "long",
                        timeZone: "UTC",
                    }),
                });
                return (
                    <ArticleTeaser
                        key={article.id}
                        title={article.title}
                        description={article.description}
                        slug={article.slug}
                        locale={article.locale as AppLocale}
                        date={article.date}
                        dateLabel={dateLabel}
                        image={article.image}
                        headingLevel={headingLevel}
                        fallback={
                            isFallback && meta
                                ? {
                                      flag: meta.flag,
                                      label: meta.native,
                                      title: t("onlyIn", { language: meta.native }),
                                  }
                                : undefined
                        }
                    />
                );
            })}
        </div>
    );
}
