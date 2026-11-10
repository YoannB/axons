"use client";
import { useCallback, useSyncExternalStore } from "react";

// Whole seconds elapsed since `since` (a Date.now() value), 0 when `since` is null.
// The clock is an EXTERNAL system read through useSyncExternalStore: an interval notifies
// React once per second while a caller is active, so there is no setState in an effect and
// no stale value when a new wait starts (the result is derived from `since` at render).
// Typical use: `useElapsedSeconds(useAiPendingSince())` to show "12 s" on a pending button.
const TICK_MS = 1000;

export function useElapsedSeconds(since: number | null): number {
    const subscribe = useCallback(
        (cb: () => void) => {
            if (since === null) return () => {};
            const id = window.setInterval(cb, TICK_MS);
            return () => window.clearInterval(id);
        },
        [since],
    );
    // Snapshot = the elapsed whole seconds (a primitive, so React only re-renders on change).
    const getSnapshot = useCallback(
        () => (since === null ? 0 : Math.max(0, Math.floor((Date.now() - since) / TICK_MS))),
        [since],
    );
    return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
