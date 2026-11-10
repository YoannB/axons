"use client";
import { StoreContext } from "@/hooks/use-store";
import { createStore, type AppState, type Consent, type ThemeMode } from "@/lib/store";
import { useMemo, type ReactNode } from "react";

// The store is created PER REQUEST/COMPONENT (factory) → no cross-request leak.
// Deterministic initial values (theme/consent) come from server props;
// client-only data (usage) is read synchronously in createStore (no effect).
export function AppStateProvider({
    initialThemeMode,
    initialConsent,
    children,
}: {
    initialThemeMode: ThemeMode;
    initialConsent: Consent | null;
    children: ReactNode;
}) {
    const store = useMemo(
        () =>
            createStore({
                themeMode: initialThemeMode,
                consent: initialConsent,
            } as Partial<AppState>),
        [initialThemeMode, initialConsent],
    );
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
