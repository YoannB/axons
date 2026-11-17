// THE SITE'S SOCIAL IMAGE — owned by a derived site (keep the export name and its type).
// Every page's og:image / twitter:image is a 1200x630 PNG drawn by `Image` with these colours,
// fonts and logo (prerendered at build by app/og/[locale]/[...path]/route.tsx). Typical changes:
// the `theme` colours; a logo or fonts of the site's own, read with a LITERAL
// `path.join(process.cwd(), "site", "…")` so the file tracer ships them; or a whole new `Image`
// (Satori JSX: flexbox, inline styles, no MUI). Which pages get their own image: SITE.ogPages.
// Guide: docs/seo-layout.md → Social images. Contract: `SiteOgImage` (lib/og/model.ts).
import { DefaultOgImage } from "@/components/og/DefaultOgImage";
import { AXONS_OG_FONT_FAMILY, loadAxonsOgFonts, loadSiteIcon } from "@/lib/og/assets";
import type { SiteOgImage } from "@/lib/og/model";
import { SITE } from "./config";

export const SITE_OG_IMAGE: SiteOgImage = {
    Image: DefaultOgImage,
    // Axons' dark tokens (styles/tokens.css) + the site's MUI accents (SITE.palette.dark).
    theme: {
        background: "#070b16",
        surface: "#131a30",
        text: "#eaf0ff",
        muted: "#9fb0d0",
        accent1: SITE.palette.dark.primary,
        accent2: SITE.palette.dark.secondary,
    },
    fontFamily: AXONS_OG_FONT_FAMILY,
    fonts: loadAxonsOgFonts,
    logo: loadSiteIcon,
};
