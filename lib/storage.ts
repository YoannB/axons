import { SITE_STORAGE_KEYS } from "@/site/storage";
import { mergeStorageKeys } from "./site-extension";

// Defensive localStorage access (SSR / private mode).
export function readLS<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const v = window.localStorage.getItem(key);
        return v ? (JSON.parse(v) as T) : fallback;
    } catch {
        return fallback;
    }
}
export function writeLS(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* quota / private mode */
    }
}
// Every localStorage key of the app, declared here ONLY (docs/react-effects.md → Theme persistence).
export const LS_USAGE = "axons-usage";
export const LS_THEME_MODE = "axons-theme-mode";

// Axons' keys + the derived site's own (site/storage.ts), by name; a collision throws at build.
// A site reads its keys from here (`STORAGE_KEYS.ideTabs`), never from a literal.
export const STORAGE_KEYS = mergeStorageKeys({ usage: LS_USAGE, themeMode: LS_THEME_MODE }, SITE_STORAGE_KEYS);
