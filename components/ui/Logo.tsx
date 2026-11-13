"use client";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/cn";
import { LOGO_VIEWBOX, LogoMark } from "@/site/logo";

// Logo frame owned by Axons (size, class, accessible name = SITE_NAME); the DRAWING is the
// site's (site/logo.tsx), so a derived site rebrands without touching this component.
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
    return (
        <svg
            className={cn("logo", className)}
            width={size}
            height={size}
            viewBox={LOGO_VIEWBOX}
            role="img"
            aria-label={SITE_NAME}
        >
            <LogoMark />
        </svg>
    );
}
