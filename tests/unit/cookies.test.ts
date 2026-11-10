// @vitest-environment node
import { COOKIE_CONSENT, COOKIE_THEME, getCookie, setCookie } from "@/lib/cookies";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

type DocumentStub = {
    jar: Map<string, string>;
    cookie: string;
};

function createDocumentStub(initial: Record<string, string> = {}): DocumentStub {
    const jar = new Map(Object.entries(initial));

    return {
        jar,
        get cookie() {
            return Array.from(jar.entries())
                .map(([name, value]) => `${name}=${value}`)
                .join("; ");
        },
        set cookie(input: string) {
            const [pair] = input.split(";");
            const eq = pair.indexOf("=");

            if (eq === -1) {
                return;
            }

            const name = pair.slice(0, eq);
            const value = pair.slice(eq + 1);

            if (/(?:^|;)\s*max-age=0(?:;|$)/.test(input)) {
                jar.delete(name);
            } else {
                jar.set(name, value);
            }
        },
    };
}

const globalRef = globalThis as typeof globalThis & {
    document?: DocumentStub;
};

let originalDocument: DocumentStub | undefined;

function setDocument(value: DocumentStub | undefined) {
    Object.defineProperty(globalThis, "document", {
        value,
        configurable: true,
        writable: true,
    });
}

beforeEach(() => {
    originalDocument = globalRef.document;
    setDocument(undefined);
});

afterEach(() => {
    setDocument(originalDocument);
});

describe("cookies — constantes", () => {
    it("expose les noms de cookies non httpOnly", () => {
        expect(COOKIE_THEME).toBe("axons-theme");
        expect(COOKIE_CONSENT).toBe("axons-consent");
    });
});

describe("setCookie — branche SSR (typeof document === undefined)", () => {
    it("ne lève pas et n'écrit nulle part", () => {
        expect(() => setCookie("any", "value")).not.toThrow();
    });
});

describe("getCookie — branche SSR (typeof document === undefined)", () => {
    it("retourne null", () => {
        expect(getCookie("any")).toBeNull();
    });
});

describe("setCookie/getCookie — branche client", () => {
    beforeEach(() => {
        setDocument(createDocumentStub());
    });

    it("écrit puis lit une valeur simple", () => {
        setCookie(COOKIE_THEME, "dark");

        expect(getCookie(COOKIE_THEME)).toBe("dark");
        expect(globalRef.document?.jar.get(COOKIE_THEME)).toBe("dark");
    });

    it("encode puis décode les caractères réservés", () => {
        const value = "a b;c=d?e";

        setCookie("query", value);

        expect(globalRef.document?.jar.get("query")).toBe(encodeURIComponent(value));
        expect(getCookie("query")).toBe(value);
    });

    it("retourne null si le cookie est absent", () => {
        expect(getCookie("missing")).toBeNull();
    });

    it("retourne une chaîne vide pour un cookie de valeur vide", () => {
        setCookie("empty", "");

        expect(getCookie("empty")).toBe("");
    });

    it("surcharge une même clé", () => {
        setCookie("theme", "light");
        setCookie("theme", "dark");

        expect(getCookie("theme")).toBe("dark");
        expect(globalRef.document?.jar.size).toBe(1);
    });

    it("lit plusieurs cookies distincts", () => {
        setCookie("theme", "dark");
        setCookie("consent", "accepted");

        expect(getCookie("theme")).toBe("dark");
        expect(getCookie("consent")).toBe("accepted");
    });

    it("lit un nom de cookie contenant un point", () => {
        setCookie("a.b", "1");

        expect(getCookie("a.b")).toBe("1");
    });
});
