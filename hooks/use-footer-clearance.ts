"use client";
import { useEffect } from "react";

// While `active` (the video is pinned bottom-right), exposes how many pixels of the page footer
// are visible as the CSS variable --footer-clearance on <html>, so a fixed bottom element can
// rise above the footer instead of covering its links. Scroll/resize are the external system:
// the effect only writes a CSS custom property (additive, non-destructive DOM sync, no React
// state, rAF-throttled) and removes it on cleanup.
export function useFooterClearance(active: boolean, selector = ".site-footer") {
    useEffect(() => {
        if (!active) return;
        const root = document.documentElement;
        let frame = 0;
        const measure = () => {
            frame = 0;
            const footer = document.querySelector<HTMLElement>(selector);
            const overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
            root.style.setProperty("--footer-clearance", `${Math.round(overlap)}px`);
        };
        const schedule = () => {
            if (!frame) frame = window.requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if (frame) window.cancelAnimationFrame(frame);
            root.style.removeProperty("--footer-clearance");
        };
    }, [active, selector]);
}
