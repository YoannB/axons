import type { SiteStorageKeys } from "@/lib/site-extension";

// THE SITE'S OWN localStorage KEYS — owned by a derived site (keep the export name).
// Declared by NAME, merged by lib/storage.ts into `STORAGE_KEYS` with Axons' keys (`usage`,
// `themeMode`); a name or key that collides throws at build. Read them back through
// `STORAGE_KEYS.<name>` (with readLS / writeLS), never from a string literal.
// Example: { ideTabs: "mysite-ide-tabs" } → STORAGE_KEYS.ideTabs. Prefix keys with the site name.
export const SITE_STORAGE_KEYS = {} as const satisfies SiteStorageKeys;
