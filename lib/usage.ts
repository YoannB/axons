// Pure daily quota logic (testable without React or MUI).
export interface UsageState {
    date: string;
    count: number;
}
export function todayISO(d = new Date()): string {
    return d.toISOString().slice(0, 10);
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
