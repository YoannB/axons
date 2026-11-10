"use client";

import { Card, Chip, Icon } from "@/components/ui";
import type { SeoResource } from "@/constants/site";
import { useTranslations } from "next-intl";
import Image from "next/image";

// Video = YouTube thumbnail; article = gradient badge with the source's initials
// (r.mark) => no more empty square with a lone </>.
export function ArticleCard({ r }: { r: SeoResource }) {
    const t = useTranslations();

    return (
        <Card as="article" className="article-card">
            <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="article-card__thumb"
                aria-label={t(r.titleKey)}
            >
                {r.kind === "video" && r.videoId ? (
                    <Image
                        src={`https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`}
                        alt=""
                        width={160}
                        height={90}
                        sizes="160px"
                        className="article-card__img"
                    />
                ) : (
                    <span className="article-card__mark" aria-hidden="true">
                        {r.mark}
                    </span>
                )}
            </a>

            <div className="article-card__body">
                <h4>{t(r.titleKey)}</h4>
                <p className="muted">{t(r.summaryKey)}</p>

                <div className="article-card__meta">
                    <Chip label={t(r.sourceKey)} color="info" />
                    <span className="dur">
                        <Icon name="clock" size={13} />
                        {t(r.durationKey)}
                    </span>
                </div>
            </div>
        </Card>
    );
}
