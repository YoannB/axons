// Pure daily quota logic (testable without React or MUI).
import { AI_QUOTA_TZ } from "@/constants/site";
import { dayIn } from "./day";
export interface UsageState {
    date: string;
    count: number;
}
// Day in the quota time zone (NEXT_PUBLIC_AI_QUOTA_TZ, UTC by default): the SAME cut as the
// server quota keys (lib/ai/quota-pure.ts), so the badge resets when the server does.
export function todayISO(d = new Date(), tz: string = AI_QUOTA_TZ): string {
    return dayIn(d.getTime(), tz);
}
export function normalizeUsage(raw: Partial<UsageState> | null | undefined): UsageState {
    const t = todayISO();
    if (!raw || raw.date !== t) return { date: t, count: 0 }; // automatic reset when the day changes
    return { date: t, count: Math.max(0, Number(raw.count) || 0) };
}
export function remaining(usage: UsageState, limit: number): number {
    return Math.max(0, limit - usage.count);
}
export function canCall(usage: UsageState, limit: number): boolean {
    return limit > 0 && remaining(usage, limit) > 0;
}
