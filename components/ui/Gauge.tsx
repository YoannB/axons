// components/ui/Gauge.tsx — animated circular SVG gauge (generic)
"use client";
import type { CSSProperties } from "react";
import { useId } from "react";
import type { AppGaugeProps } from "./types";

export function Gauge({ value, max = 100, label, size = 96, tone = "default" }: AppGaugeProps) {
    const pct = Math.max(0, Math.min(1, value / max));
    const r = (size - 10) / 2;
    const c = 2 * Math.PI * r;
    // Length of the colored arc and of the spark, in path units (plain numbers;
    // converted to px in the CSS via * 1px). The spark = 18% of the colored arc,
    // so always <= arc; the back-and-forth travel = arc - spark.
    const arc = c * pct;
    const spark = arc * 0.18;
    const travel = arc - spark;
    const gid = useId();
    return (
        <div className={tone === "default" ? "gauge" : `gauge gauge--${tone}`} style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                role="img"
                aria-label={label ?? `${Math.round(pct * 100)}%`}
            >
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--accent-1)" />
                        <stop offset="100%" stopColor="var(--accent-2)" />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={r} className="gauge__track" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    className="gauge__fill"
                    stroke={`url(#${gid})`}
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - pct)}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                {/* Spark confined to the colored arc, moving back and forth (same principle as
            the icon draw, not a 360 rotation). The dasharray is set IN CSS from
            the variables below (single gap = c - spark => it never
            reappears in the grey area). Decorative: outside the accessibility tree. */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    className="gauge__sheen"
                    style={
                        {
                            "--gauge-c": `${c}`,
                            "--gauge-arc": `${arc}`,
                            "--gauge-spark": `${spark}`,
                            "--gauge-travel": `${travel}`,
                        } as CSSProperties
                    }
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    aria-hidden="true"
                />
            </svg>
            <span className="gauge__value">{Math.round(pct * 100)}%</span>
        </div>
    );
}
