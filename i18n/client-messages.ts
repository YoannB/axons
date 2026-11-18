import { SITE } from "@/site/config";

// Message paths serialized to the CLIENT provider (app/[locale]/layout.tsx → pickMessages): the
// namespaces read by Axons' Client Components through `useTranslations`, plus the site's own
// (`SITE.clientMessages`). Server Components read the full catalogue with `getTranslations` and
// need nothing here. tests/unit/client-messages.test.ts fails when a `useTranslations` call reads
// a namespace missing from this list. See docs/i18n.md → Client messages.
const AXONS_CLIENT_MESSAGES = [
    "aiNotice",
    "comments",
    "common",
    "cookie",
    "errors",
    "faq",
    "features",
    "footer",
    "hero",
    "nav",
    "notFound",
    "seo",
    "showcase",
    "theme",
] as const;

export const CLIENT_MESSAGES: readonly string[] = [...AXONS_CLIENT_MESSAGES, ...SITE.clientMessages];
