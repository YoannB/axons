// components/ui/EmptyUniverse.tsx — decorative "nothing here" illustration (generic SVG, no MUI)
// An astronaut floating with a magnifying glass between stars and a ringed planet: the empty
// state of 404 / no-content pages. Decorative (aria-hidden): the page text carries the meaning.
// Colors come from the theme tokens (accents) plus a fixed light suit readable in both themes.
// Animations (float, twinkle) are CSS-only and disabled under prefers-reduced-motion.
const STARS: [number, number, number][] = [
    [22, 30, 1.6],
    [64, 92, 1.2],
    [108, 18, 2],
    [158, 54, 1.3],
    [204, 24, 1.8],
    [282, 38, 1.4],
    [302, 104, 2],
    [36, 168, 1.8],
    [134, 196, 1.3],
    [190, 150, 1.1],
];

export function EmptyUniverse({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 320 220"
            className={className ? `empty-universe ${className}` : "empty-universe"}
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <linearGradient id="empty-universe-planet" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" style={{ stopColor: "var(--accent-1)" }} />
                    <stop offset="1" style={{ stopColor: "var(--accent-2)" }} />
                </linearGradient>
            </defs>
            {STARS.map(([cx, cy, r], i) => (
                <circle
                    key={i}
                    className="empty-universe__star"
                    cx={cx}
                    cy={cy}
                    r={r}
                    style={{ animationDelay: `${(i % 5) * 0.6}s` }}
                />
            ))}
            <circle cx="250" cy="160" r="34" fill="url(#empty-universe-planet)" opacity="0.9" />
            <ellipse
                cx="250"
                cy="160"
                rx="58"
                ry="12"
                fill="none"
                className="empty-universe__ring"
                transform="rotate(-15 250 160)"
            />
            <g transform="translate(118 92) rotate(-12)">
                <g className="empty-universe__astronaut">
                    <rect x="-27" y="8" width="16" height="34" rx="5" className="empty-universe__pack" />
                    <path d="M-6 52 L-10 70 M10 52 L14 70" className="empty-universe__limb" />
                    <rect x="-18" y="10" width="40" height="46" rx="14" className="empty-universe__suit" />
                    <path d="M-16 22 L-32 36 M20 20 L35 7" className="empty-universe__limb" />
                    <circle cx="44" cy="-4" r="10" fill="none" className="empty-universe__lens" />
                    <path d="M37 3 L33 8" className="empty-universe__lens" />
                    <circle cx="2" cy="0" r="22" className="empty-universe__suit" />
                    <rect x="-12" y="-10" width="28" height="18" rx="9" fill="#1b2340" />
                    <ellipse cx="9" cy="-5" rx="4" ry="2" className="empty-universe__glint" />
                    <text x="60" y="-16" className="empty-universe__question">
                        ?
                    </text>
                </g>
            </g>
        </svg>
    );
}
