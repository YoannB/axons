// @vitest-environment node
import { buildSecurityHeaders, parseFrameAncestors } from "@/lib/security-headers";
import { describe, expect, it } from "vitest";

const header = (h: { key: string; value: string }[], key: string) => h.find((x) => x.key === key)?.value;
const csp = (ancestors: string[], isDev = false) =>
    header(buildSecurityHeaders({ isDev, frameAncestors: ancestors }), "Content-Security-Policy") as string;

describe("parseFrameAncestors — FRAME_ANCESTORS", () => {
    it.each([undefined, "", "  "])("même origine par défaut (%j)", (raw) => {
        expect(parseFrameAncestors(raw)).toEqual(["'self'"]);
    });
    it("ajoute les origines https (espaces ou virgules), garde 'self', dédoublonne", () => {
        expect(parseFrameAncestors("https://ezjsdev.netlify.app, https://*.example.com:8443 'self'")).toEqual([
            "'self'",
            "https://ezjsdev.netlify.app",
            "https://*.example.com:8443",
        ]);
    });
    it("'none' seul interdit tout encadrement", () => {
        expect(parseFrameAncestors("'none'")).toEqual(["'none'"]);
    });
    it("'none' combiné à une autre source est une erreur", () => {
        expect(() => parseFrameAncestors("'none' https://a.dev")).toThrow(/'none' ne se combine/);
    });
    it.each(["http://insecure.dev", "*", "https://a.dev/path", "javascript:alert(1)"])(
        "rejette une source invalide (%s)",
        (raw) => {
            expect(() => parseFrameAncestors(raw)).toThrow(/FRAME_ANCESTORS invalide/);
        },
    );
});

describe("buildSecurityHeaders", () => {
    it("même origine : X-Frame-Options SAMEORIGIN + frame-ancestors 'self'", () => {
        const h = buildSecurityHeaders({ isDev: false, frameAncestors: ["'self'"] });
        expect(header(h, "X-Frame-Options")).toBe("SAMEORIGIN");
        expect(csp(["'self'"])).toContain("frame-ancestors 'self'");
    });
    it("'none' : X-Frame-Options DENY", () => {
        const h = buildSecurityHeaders({ isDev: false, frameAncestors: ["'none'"] });
        expect(header(h, "X-Frame-Options")).toBe("DENY");
        expect(csp(["'none'"])).toContain("frame-ancestors 'none'");
    });
    it("liste autorisée : pas de X-Frame-Options (il ne sait pas l'exprimer), CSP faisant foi", () => {
        const list = ["'self'", "https://ezjsdev.netlify.app"];
        const h = buildSecurityHeaders({ isDev: false, frameAncestors: list });
        expect(header(h, "X-Frame-Options")).toBeUndefined();
        expect(csp(list)).toContain("frame-ancestors 'self' https://ezjsdev.netlify.app");
    });
    it("eval autorisé seulement en développement", () => {
        expect(csp(["'self'"], true)).toContain("'unsafe-eval' 'wasm-unsafe-eval'");
        expect(csp(["'self'"], false)).not.toContain("unsafe-eval");
    });
    it("garde les en-têtes de base", () => {
        const h = buildSecurityHeaders({ isDev: false, frameAncestors: ["'self'"] });
        expect(header(h, "X-Content-Type-Options")).toBe("nosniff");
        expect(header(h, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        expect(header(h, "Permissions-Policy")).toContain("camera=()");
    });
});
