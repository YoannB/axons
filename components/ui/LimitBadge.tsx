"use client";
import { useDailyLimiter } from "@/hooks/use-daily-limiter";
import { cn } from "@/lib/cn";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

// Shows the USAGE (count / limit). Hidden if limit <= 0.
// className enables the compact header variant (limit-badge--header).
export function LimitBadge({ className }: { className?: string }) {
    const { hidden, count, limit } = useDailyLimiter();
    const t = useTranslations("hero");
    if (hidden) return null;
    return (
        <span className={cn("limit-badge", className)} title={t("limitSuffix", { count: limit })}>
            <Icon name="clock" size={15} />
            <span className="limit-badge__num">{count}</span>
            <span>/ {limit}</span>
        </span>
    );
}
