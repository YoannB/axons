"use client";
import { AI_DAILY_LIMIT } from "@/constants/site";
import { canCall, remaining } from "@/lib/usage";
import { useStore, useUsage } from "./use-store";

export function useDailyLimiter() {
    const store = useStore();
    const usage = useUsage();
    const limit = AI_DAILY_LIMIT;
    return {
        limit,
        count: usage.count,
        remaining: remaining(usage, limit),
        canCall: canCall(usage, limit),
        hidden: limit <= 0,
        increment: () => store.incrementUsage(),
        reset: () => store.resetUsage(), // only called by the dev button (rendering gated on NODE_ENV)
    };
}
