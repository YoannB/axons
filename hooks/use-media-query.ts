"use client";
import { useCallback, useSyncExternalStore } from "react";

// Subscription to an external system (matchMedia) via useSyncExternalStore:
// no setState in an effect, no cascade.
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (cb: () => void) => {
            const mq = window.matchMedia(query);
            mq.addEventListener("change", cb);
            return () => mq.removeEventListener("change", cb);
        },
        [query],
    );
    const getSnap = useCallback(() => window.matchMedia(query).matches, [query]);
    const getServerSnap = useCallback(() => false, []);
    return useSyncExternalStore(subscribe, getSnap, getServerSnap);
}
