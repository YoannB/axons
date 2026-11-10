"use client";
import { COOKIE_THEME, setCookie } from "@/lib/cookies";
import { LS_THEME_MODE, writeLS } from "@/lib/storage";
import type { ThemeMode } from "@/lib/store";
import { useEffect } from "react";
import { useMediaQuery } from "./use-media-query";
import { useStore, useThemeMode } from "./use-store";

export function useTheme() {
    const store = useStore();
    const mode = useThemeMode(); // read from the store (already hydrated synchronously)
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

    // "system" resolution = value derived DURING render (no state, no effect).
    const effective: "light" | "dark" = mode === "system" ? (prefersDark ? "dark" : "light") : mode;

    // DOM synchronization (external system): mutation only, NO setState → legitimate effect.
    useEffect(() => {
        document.documentElement.dataset.theme = effective;
    }, [effective]);

    // Persisted write: user intent → handler (legitimate), double storage on purpose.
    const setMode = (m: ThemeMode) => {
        store.setThemeMode(m); // updates the store (derived re-render)
        setCookie(COOKIE_THEME, m); // read by the anti-flash inline script in <head>
        writeLS(LS_THEME_MODE, m); // read by hydrateClient() on the next load
    };
    const toggle = () => setMode(effective === "dark" ? "light" : "dark");

    return { mode, effective, setMode, toggle };
}
