"use client";
export class ApiError extends Error {
    constructor(
        public code: string,
        public status: number,
        message?: string,
    ) {
        super(message ?? code);
        this.name = "ApiError";
    }
}

// Client > server (25 s model + 4 s max quota): the server's "timeout" reply arrives before
// the browser gives up. The whole stays below the ~30 s Netlify function limit.
const TIMEOUT_MS = 30_000;

export async function postJson<T>(path: string, body: unknown, externalSignal?: AbortSignal): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), TIMEOUT_MS);
    const onExternal = () => controller.abort(externalSignal?.reason);
    externalSignal?.addEventListener("abort", onExternal, { once: true });
    try {
        const res = await fetch(path, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const err = (data as { error?: { code?: string; message?: string } }).error;
            throw new ApiError(err?.code ?? "generic", res.status, err?.message);
        }
        return data as T;
    } catch (e) {
        if (e instanceof ApiError) throw e;
        if ((e as Error)?.name === "TimeoutError" || (e as Error)?.name === "AbortError") {
            throw new ApiError("timeout", 504);
        }
        throw new ApiError("generic", 500, (e as Error)?.message);
    } finally {
        clearTimeout(timer);
        externalSignal?.removeEventListener("abort", onExternal);
    }
}
