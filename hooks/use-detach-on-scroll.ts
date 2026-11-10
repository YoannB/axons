"use client";
import { useEffect, useRef, useState } from "react";

export type DetachMode = "flow" | "fixed";

// BIDIRECTIONAL switch but WITHOUT oscillation. The key is not to restrict the direction
// (a player that never returns to its place is a defect), but to freeze the geometry:
// the calling component places a sentinel at position:absolute AT THE TOP of the video
// (it depends on no state) and an in-flow placeholder that takes the same height as soon
// as the video becomes fixed. The block height is therefore IDENTICAL in flow and fixed =>
// the switch never moves the sentinel => no flow<->fixed loop.
// setPinned is in the IntersectionObserver callback (external system) => complies
// with "You Might Not Need an Effect" (no setState in an effect body).
export function useDetachOnScroll() {
    const sentinelRef = useRef<HTMLSpanElement>(null);
    const [pinned, setPinned] = useState(false);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const io = new IntersectionObserver(
            ([e]) => {
                // fixed as soon as the TOP of the video crosses the top of the viewport; flow as soon as it reappears.
                setPinned(!e.isIntersecting && e.boundingClientRect.top < 0);
            },
            { threshold: 0 },
        );
        io.observe(sentinel);
        return () => io.disconnect();
    }, []);

    return { sentinelRef, mode: (pinned ? "fixed" : "flow") as DetachMode };
}
