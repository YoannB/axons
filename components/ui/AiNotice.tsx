// components/ui/AiNotice.tsx — transparency notes next to an AI action (generic, no MUI)
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import type { AppAiNoticeProps } from "./types";

// Short disclosure lines shown under an AI button: third-party provider, free-model quality,
// expected wait. The lines come in already translated (messages/*.json "aiNotice"), so the
// component stays free of next-intl and documentable in Storybook.
export function AiNotice({ items, className }: AppAiNoticeProps) {
    if (items.length === 0) return null;
    return (
        <ul className={cn("ai-notice", className)}>
            {items.map((item, k) => (
                <li key={k} className="ai-notice__item">
                    <Icon name="shield" size={14} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
