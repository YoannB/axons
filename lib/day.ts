// PURE calendar-day helpers shared by the client counter (lib/usage.ts) and the server quota
// (lib/ai/quota-pure.ts, also imported by the scheduled purge function): both sides MUST cut
// the "day" at the same instant, otherwise the badge and the server disagree around midnight.
// No implicit clock: `now` is injected. No Node or browser API beyond Intl.

export const DEFAULT_TIME_ZONE = "UTC";

/** IANA time zone from an env value. Empty => UTC; an unknown zone throws (fail at build). */
export function resolveTimeZone(raw: string | undefined): string {
    const tz = raw?.trim() || DEFAULT_TIME_ZONE;
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
    } catch {
        throw new Error(`Invalid NEXT_PUBLIC_AI_QUOTA_TZ: ${JSON.stringify(tz)} is not an IANA time zone.`);
    }
    return tz;
}

// One formatter per zone (Intl construction is the costly part).
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatterFor(tz: string): Intl.DateTimeFormat {
    let f = formatters.get(tz);
    if (!f) {
        f = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hourCycle: "h23",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        formatters.set(tz, f);
    }
    return f;
}

function wallClock(now: number, tz: string): Record<"year" | "month" | "day" | "hour" | "minute" | "second", string> {
    const parts: Record<string, string> = {};
    for (const p of formatterFor(tz).formatToParts(now)) parts[p.type] = p.value;
    return parts as Record<"year" | "month" | "day" | "hour" | "minute" | "second", string>;
}

/** Calendar day "YYYY-MM-DD" of `now` in `tz` (UTC => same as toISOString().slice(0, 10)). */
export function dayIn(now: number, tz: string = DEFAULT_TIME_ZONE): string {
    const p = wallClock(now, tz);
    return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Seconds until the next midnight in `tz`, at least 1. Computed from the wall clock, so on a
 * DST-change day it can be off by the shift (one hour): fine for a Retry-After hint.
 */
export function secondsUntilMidnightIn(now: number, tz: string = DEFAULT_TIME_ZONE): number {
    const p = wallClock(now, tz);
    const elapsed = Number(p.hour) * 3600 + Number(p.minute) * 60 + Number(p.second);
    const fraction = (now % 1000) / 1000;
    return Math.max(1, Math.ceil(86_400 - elapsed - fraction));
}
