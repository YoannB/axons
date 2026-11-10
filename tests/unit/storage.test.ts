// @vitest-environment node
import { LS_THEME_MODE, LS_USAGE, readLS, writeLS } from "@/lib/storage";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

type LocalStorageStub = {
    store: Map<string, string>;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
};

type WindowStub = {
    localStorage: LocalStorageStub;
};

function createLocalStorageStub(
    behaviour: Partial<Pick<LocalStorageStub, "getItem" | "setItem">> = {},
): LocalStorageStub {
    const store = new Map<string, string>();

    return {
        store,
        getItem(key) {
            if (behaviour.getItem) {
                return behaviour.getItem(key);
            }

            return store.get(key) ?? null;
        },
        setItem(key, value) {
            if (behaviour.setItem) {
                behaviour.setItem(key, value);
                return;
            }

            store.set(key, String(value));
        },
    };
}

const globalRef = globalThis as typeof globalThis & {
    window?: WindowStub;
};

let originalWindow: WindowStub | undefined;

function setWindow(value: WindowStub | undefined) {
    Object.defineProperty(globalThis, "window", {
        value,
        configurable: true,
        writable: true,
    });
}

beforeEach(() => {
    originalWindow = globalRef.window;
    setWindow(undefined);
});

afterEach(() => {
    setWindow(originalWindow);
});

describe("storage — constantes", () => {
    it("expose les clés localStorage déclarées centralisement", () => {
        expect(LS_USAGE).toBe("axons-usage");
        expect(LS_THEME_MODE).toBe("axons-theme-mode");
    });
});

describe("readLS — branche SSR (typeof window === undefined)", () => {
    it("retourne immédiatement le fallback", () => {
        expect(readLS("any", "fallback")).toBe("fallback");
    });
});

describe("readLS — branche client", () => {
    it("retourne le fallback si la clé est absente", () => {
        const storage = createLocalStorageStub();
        setWindow({ localStorage: storage });

        expect(readLS("missing", "fallback")).toBe("fallback");
    });

    it("retourne le fallback si la valeur stockée est une chaîne vide", () => {
        const storage = createLocalStorageStub();
        storage.store.set("empty", "");
        setWindow({ localStorage: storage });

        expect(readLS("empty", "fallback")).toBe("fallback");
    });

    it("parse une valeur JSON valide", () => {
        const storage = createLocalStorageStub();
        storage.store.set("usage", JSON.stringify({ date: "2026-10-20", count: 2 }));
        setWindow({ localStorage: storage });

        expect(readLS<{ date: string; count: number } | null>("usage", null)).toEqual({
            date: "2026-10-20",
            count: 2,
        });
    });

    it("retourne le fallback si JSON.parse lève", () => {
        const storage = createLocalStorageStub();
        storage.store.set("broken", "{");
        setWindow({ localStorage: storage });

        expect(readLS("broken", "fallback")).toBe("fallback");
    });

    it("autorise un fallback null", () => {
        const storage = createLocalStorageStub();
        setWindow({ localStorage: storage });

        expect(readLS<string | null>("missing", null)).toBeNull();
    });
});

describe("writeLS — branche SSR", () => {
    it("ne lève pas et n'écrit nulle part", () => {
        expect(() => writeLS("any", { a: 1 })).not.toThrow();
    });
});

describe("writeLS — branche client", () => {
    it("sérialise la valeur en JSON", () => {
        const storage = createLocalStorageStub();
        setWindow({ localStorage: storage });

        writeLS("theme", { mode: "dark" });

        expect(storage.store.get("theme")).toBe('{"mode":"dark"}');
    });

    it("stocke une chaîne sous forme de valeur JSON", () => {
        const storage = createLocalStorageStub();
        setWindow({ localStorage: storage });

        writeLS("raw", "v");

        expect(storage.store.get("raw")).toBe('"v"');
    });

    it("avale silencieusement une erreur de setItem", () => {
        const storage = createLocalStorageStub({
            setItem: () => {
                throw new Error("QuotaExceededError");
            },
        });
        setWindow({ localStorage: storage });

        expect(() => writeLS("any", 1)).not.toThrow();
    });
});
