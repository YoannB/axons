"use client";
import type { AppState, Store } from "@/lib/store";
import { createContext, useContext, useSyncExternalStore } from "react";

export const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
    const s = useContext(StoreContext);
    if (!s) throw new Error("useStore doit être utilisé sous <AppStateProvider>.");
    return s;
}

// Full snapshot; getServerState guarantees no hydration mismatch
// for client-only data (usage, consent) without effect or setState.
export function useAppState(): AppState {
    const s = useStore();
    return useSyncExternalStore(s.subscribe, s.getState, s.getServerState);
}
export function useThemeMode() {
    return useAppState().themeMode;
}
export function useConsent() {
    return useAppState().consent;
}
export function useUsage() {
    return useAppState().usage;
}
export function useAiPending() {
    return useAppState().aiPending;
}
export function useToasts() {
    return useAppState().toasts;
}
