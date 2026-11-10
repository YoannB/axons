import "server-only";
// Best-effort sliding window per IP, in instance memory. It is NOT a reliable
// counter across serverless invocations: it is a free first filter against naive
// bots, called BEFORE the enforceable quota (lib/ai/quota.ts, Netlify Blobs). Hard
// financial cap = credit limit on the OpenRouter key (docs/ai-capabilities.md → Rate limit).
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
// Memory bound: without it, a client changing IP on every request grows the
// Map endlessly (expired buckets used to never be purged).
const MAX_BUCKETS = 10_000;

// Client IP. On Netlify, x-nf-client-connection-ip is set by the edge and overrides any
// value sent by the client => cannot be spoofed. x-forwarded-for is only a fallback
// (local dev, other hosts): its first value is controlled by the client.
export function clientIpFrom(headers: Headers): string {
    const netlify = headers.get("x-nf-client-connection-ip")?.trim();
    if (netlify) return netlify;

    return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function makeRoom(now: number): void {
    for (const [key, bucket] of buckets) {
        if (now > bucket.resetAt) buckets.delete(key);
    }

    // Still full after the purge (flood of distinct IPs within the window): evict the oldest
    // (Map insertion order). Bounded memory > accuracy under attack.
    if (buckets.size >= MAX_BUCKETS) {
        const oldest = buckets.keys().next().value as string;
        buckets.delete(oldest);
    }
}

export function hitRateLimit(ip: string): boolean {
    const now = Date.now();
    const b = buckets.get(ip);
    if (!b || now > b.resetAt) {
        if (!b && buckets.size >= MAX_BUCKETS) makeRoom(now);
        buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
    if (b.count >= MAX_PER_WINDOW) return false;
    b.count += 1;
    return true;
}
