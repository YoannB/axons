import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Development needs 'unsafe-eval' (React rebuilds call stacks via eval())
// and 'wasm-unsafe-eval' (some Turbopack tooling). In production React never uses eval(),
// so these sources are dropped and the policy is hardened. 'unsafe-inline' is still required for
// scripts (anti-flash bootScript) and styles (Emotion / Material UI), production included.
const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            [
                "script-src 'self' 'unsafe-inline'",
                ...(isDev ? ["'unsafe-eval'", "'wasm-unsafe-eval'"] : []),
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
            "frame-ancestors 'self'",
        ].join("; "),
    },
];

const nextConfig: NextConfig = {
    poweredByHeader: false,
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
    experimental: {
        optimizePackageImports: ["@mui/material", "@mui/icons-material"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.ytimg.com",
            },
            {
                protocol: "https",
                hostname: "img.youtube.com",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
