"use client";
import { cn } from "@/lib/cn";
import type { AppIconProps, IconName } from "./types";

// Animatable outline (draw + ghost) per icon. The cookie is a CLEAN DISC: the old
// version (circle + concave bite + h.01 dots) was unrecognizable as a pure stroke and
// its micro-segments flickered under the draw animation. A cookie reads as one thanks to
// the disc + SOLID chips, hence the DOTS field below.
const OUTLINE: Record<IconName, string> = {
    star: "M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z",
    bolt: "M13 2L4 14h6l-1 8 9-12h-6z",
    heart: "M12 21s-7-4.5-9.5-9C.8 8.6 3 5 6.5 5 8.7 5 10.5 6.3 12 8c1.5-1.7 3.3-3 5.5-3C21 5 23.2 8.6 21.5 12 19 16.5 12 21 12 21z",
    shield: "M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z",
    clock: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v6l4 2",
    globe: "M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20",
    palette:
        "M12 2a10 10 0 000 20c1.5 0 2-1 2-2s-1-1.5-1-2.5.8-1.5 2-1.5h2a4 4 0 004-4c0-5-4.5-8-9-8zM6.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z",
    // Clean disc (radius 9, center 12,12). The chips are in DOTS (solid fill, not animated).
    cookie: "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18",
    box: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
    sparkles:
        "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z",
    check: "M5 13l4 4L19 7",
    rocket: "M5 15c-1 1-1 4-1 4s3 0 4-1M9 11a8 8 0 018-8c2 0 3 1 3 3a8 8 0 01-8 8l-3 3-3-3zM14 8h.01",
    link: "M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1",
    code: "M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12",
};

// SOLID dots (fill currentColor, stroke none, NOT animated) per icon. Only the
// cookie has some today; the mechanism is generic. They stay still while
// the outline draws itself, which is exactly the expected look of a chocolate chip cookie.
const DOTS: Partial<Record<IconName, string[]>> = {
    cookie: [
        "M8.35 9.5a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0",
        "M12.85 10.5a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0",
        "M8.85 14.5a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0",
        "M13.35 14.5a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0",
    ],
};

// Animated mode: dashed ghost (sketch, always visible) + a draw stroke tracing itself, on
// the OUTLINE only. DOTS are rendered as fill, outside ghost/draw, so they stay stable.
// Static mode: a single clean stroke (ghost hidden, draw without dasharray) + solid dots.
export function Icon({ name, size = 22, animated = false, className }: AppIconProps) {
    const d = OUTLINE[name];
    const dots = DOTS[name] ?? [];
    return (
        <svg
            className={cn("ui-icon", animated && "ui-icon--animated", className)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path className="ui-icon__ghost" d={d} pathLength={1} />
            <path className="ui-icon__draw" d={d} pathLength={1} />
            {dots.map((dd, i) => (
                <path key={i} className="ui-icon__dot" d={dd} />
            ))}
        </svg>
    );
}
