"use client";
import { useCallback, useState } from "react";

// Copy driven by a handler (user intent); the "copied" state
// is set in the .then callback, not in an effect.
export function useCopyToClipboard(resetMs = 1800) {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(
        async (text: string) => {
            try {
                await navigator.clipboard?.writeText(text); // HTTPS / secure context
                setCopied(true);
                setTimeout(() => setCopied(false), resetMs);
                return true;
            } catch {
                setCopied(false);
                return false;
            }
        },
        [resetMs],
    );
    return { copied, copy };
}
