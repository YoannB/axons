"use client";
import { cn } from "@/lib/cn";

// The pulse travels the axon BACK AND FORTH (keyPoints 0;1;0) instead of looping
// 0->1->0 by teleporting: no more visible jump at the end of the run. keySplines
// softens the ends. The orbit and the core already loop symmetrically (no jump).
export function Logo({ size = 36, className }: { size?: number; className?: string }) {
    return (
        <svg
            className={cn("logo", className)}
            width={size}
            height={size}
            viewBox="0 0 48 48"
            role="img"
            aria-label="Axons"
        >
            <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent-1)" />
                    <stop offset="100%" stopColor="var(--accent-2)" />
                </linearGradient>
            </defs>
            <circle className="logo__orbit" cx="24" cy="24" r="18" />
            <path className="logo__axon" d="M10 30 C 18 30, 18 18, 26 18 S 36 26, 38 16" />
            <circle className="logo__pulse" r="2.6" cx="0" cy="0">
                <animateMotion
                    dur="3.2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyPoints="0;1;0"
                    keyTimes="0;0.5;1"
                    keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                    path="M10 30 C 18 30, 18 18, 26 18 S 36 26, 38 16"
                />
            </circle>
            <path className="logo__core" d="M24 12 L33 33 H15 Z" fill="url(#logoGrad)" />
        </svg>
    );
}
