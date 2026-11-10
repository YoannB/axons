"use client";
import { useCallback, useEffect, useState } from "react";

// Reveals `count` items one by one (a scripted terminal, an onboarding checklist, a fake
// progress log). Pure UI timing: no network, nothing persisted.
//   const seq = useScriptedSequence(LINES.length);
//   <Terminal lines={LINES.slice(0, seq.shown)} running={seq.status === "running"} />
//   <Button onClick={seq.start} disabled={seq.status === "running"}>Run</Button>
// The interval is the external system: setState happens in its callback, never in the effect
// body. prefers-reduced-motion is read in the start handler: the whole sequence then appears
// at once (status "done" immediately).
export type SequenceStatus = "idle" | "running" | "done";

export function useScriptedSequence(count: number, stepMs = 450) {
    const [state, setState] = useState<{ status: SequenceStatus; shown: number }>({ status: "idle", shown: 0 });

    useEffect(() => {
        if (state.status !== "running") return;
        const id = window.setInterval(() => {
            setState((s) => {
                const shown = s.shown + 1;
                return shown >= count ? { status: "done", shown: count } : { status: "running", shown };
            });
        }, stepMs);
        return () => window.clearInterval(id);
    }, [state.status, count, stepMs]);

    const start = useCallback(() => {
        const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        setState(reduced || count === 0 ? { status: "done", shown: count } : { status: "running", shown: 1 });
    }, [count]);
    const reset = useCallback(() => setState({ status: "idle", shown: 0 }), []);

    return { ...state, start, reset };
}
