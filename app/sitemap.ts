import { SITE_URL } from "@/constants/site";
import { getPathname, routing } from "@/i18n/routing";
import type { MetadataRoute } from "next";

type LogicalHref = "/" | "/sitemap" | "/legal" | "/privacy" | "/cookies";
const HREFS: LogicalHref[] = ["/", "/sitemap", "/legal", "/privacy", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    return HREFS.flatMap((href) =>
        routing.locales.map((locale) => ({
            url: new URL(getPathname({ locale, href }), SITE_URL).toString(),
            lastModified: now,
            changeFrequency: href === "/" ? "weekly" : "monthly",
            priority: href === "/" ? 1 : 0.6,
        })),
    );
}
