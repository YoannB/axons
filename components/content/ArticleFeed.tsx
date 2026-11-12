import { ArticleTeaser } from "@/components/content/ArticleTeaser";
import { LOCALES } from "@/constants/site";
import type { AppLocale } from "@/i18n/locales";
import type { ListedArticle } from "@/lib/articles/parse";
import type { EntryHref } from "@/lib/seo";
import { getFormatter, getTranslations } from "next-intl/server";

// Server Component: list of entry teasers of a collection for `locale` (listing page and home
// block). Dates are formatted by next-intl in UTC: a front-matter date is a calendar day.
export async function ArticleFeed({
    items,
    locale,
    headingLevel,
    namespace = "pages.articles",
    itemHref = "/articles/[slug]",
}: {
    items: ListedArticle[];
    locale: string;
    headingLevel?: "h2" | "h3";
    // Collection messages namespace and entry route (defaults: Axons' articles).
    namespace?: string;
    itemHref?: EntryHref;
}) {
    const format = await getFormatter({ locale });
    const t = await getTranslations({ locale, namespace });
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
                        itemHref={itemHref}
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
