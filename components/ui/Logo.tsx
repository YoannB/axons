"use client";
import { SITE_NAME } from "@/constants/site";
import { cn } from "@/lib/cn";
import { LOGO_VIEWBOX, LogoMark } from "@/site/logo";
import { useId } from "react";

// Logo frame owned by Axons (size, class, accessible name = SITE_NAME); the DRAWING is the
// site's (site/logo.tsx), so a derived site rebrands without touching this component.
// `id` (useId: unique per rendered logo, stable between server and hydration) lets the drawing
// build its SVG ids: the splash, the header and a loader may show the logo at the same time.
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
    const id = useId();
    return (
        <svg
            className={cn("logo", className)}
            width={size}
            height={size}
            viewBox={LOGO_VIEWBOX}
            role="img"
            aria-label={SITE_NAME}
        >
            <LogoMark id={id} />
        </svg>
    );
}
