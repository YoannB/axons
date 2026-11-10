"use client";
import { AI_DAILY_LIMIT, AI_ENABLED } from "@/constants/site";
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
        // AI_ENABLED folds in "no OpenRouter key at build" and "limit 0": every AI surface reads
        // `hidden` / `canCall` from here, so one switch hides them all.
        canCall: AI_ENABLED && canCall(usage, limit),
        hidden: !AI_ENABLED,
        increment: () => store.incrementUsage(),
        reset: () => store.resetUsage(), // only called by the dev button (rendering gated on NODE_ENV)
    };
}
