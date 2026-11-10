// PURE builder of the HTTP security headers applied by next.config.ts to every route.
// Kept out of next.config.ts so each branch is unit-tested (tests/unit/security-headers.test.ts).

export interface HeaderPair {
    key: string;
    value: string;
}

const SOURCE = /^(?:'self'|'none'|https:\/\/(?:\*\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)*(?::\d{1,5})?)$/i;

/**
 * Origins allowed to embed the site in an iframe, from FRAME_ANCESTORS (space- or
 * comma-separated CSP sources: 'self', 'none', https://host, https://*.host, optional port).
 * Empty => ['self'] (same-origin only, the historical default). An invalid source throws at
 * build time: a typo must not silently open, nor silently close, framing.
 * 'self' is always kept unless the list is exactly 'none'.
 */
export function parseFrameAncestors(raw: string | undefined): string[] {
    const tokens = (raw ?? "")
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean);
    if (tokens.length === 0) return ["'self'"];
    const invalid = tokens.filter((t) => !SOURCE.test(t));
    if (invalid.length > 0) throw new Error(`FRAME_ANCESTORS invalide : ${invalid.join(", ")}`);
    if (tokens.includes("'none'")) {
        if (tokens.length > 1) throw new Error("FRAME_ANCESTORS : 'none' ne se combine avec aucune autre source");
        return ["'none'"];
    }
    return [...new Set(["'self'", ...tokens])];
}

export function buildSecurityHeaders(opts: { isDev: boolean; frameAncestors: string[] }): HeaderPair[] {
    const ancestors = opts.frameAncestors;
    // X-Frame-Options cannot express an allowlist: it is sent only when it says the same thing as
    // frame-ancestors (old browsers), and dropped when other origins may embed the site (CSP
    // frame-ancestors is authoritative wherever it is supported).
    const sameOriginOnly = ancestors.length === 1 && ancestors[0] === "'self'";
    const noFraming = ancestors.length === 1 && ancestors[0] === "'none'";
    const xfo: HeaderPair[] = sameOriginOnly
        ? [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]
        : noFraming
          ? [{ key: "X-Frame-Options", value: "DENY" }]
          : [];
    return [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ...xfo,
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
            key: "Content-Security-Policy",
            value: [
                "default-src 'self'",
                [
                    "script-src 'self' 'unsafe-inline'",
                    // Development needs 'unsafe-eval' (React rebuilds call stacks via eval()) and
                    // 'wasm-unsafe-eval' (some Turbopack tooling); production drops both.
                    ...(opts.isDev ? ["'unsafe-eval'", "'wasm-unsafe-eval'"] : []),
                    "https://www.googletagmanager.com",
                    "https://www.youtube.com",
                    "https://www.youtube-nocookie.com",
                ].join(" "),
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
                "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com",
                "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
                "font-src 'self' data:",
                "base-uri 'self'",
                "form-action 'self'",
                `frame-ancestors ${ancestors.join(" ")}`,
            ].join("; "),
        },
    ];
}
