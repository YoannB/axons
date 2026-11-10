"use client";

import { useEffect, useRef, useState } from "react";

// STABLE width: an invisible ghost (the longest word) reserves the space in the flow;
// the animated words are absolutely positioned on top => the <h1> no longer reflows, and the
// neighbouring column (hence the inputs) no longer moves.
//
// Real scrolling: the old word leaves (rollOut), the new one enters (rollIn), via a
// { i, prev } state updated INSIDE the timer callback (external system) => complies with
// "You Might Not Need an Effect" (no setState in an effect body).
export function HeroRoulette({ words }: { words: string[] }) {
    const [state, setState] = useState<{ i: number; prev: string | null }>({
        i: 0,
        prev: null,
    });

    const wordsRef = useRef(words);

    useEffect(() => {
        wordsRef.current = words;
    }, [words]);

    const canRotate = words.length > 1;

    useEffect(() => {
        if (!canRotate) {
            return;
        }

        const id = setInterval(() => {
            setState((current) => {
                const list = wordsRef.current;

                if (list.length <= 1) {
                    return current;
                }

                const currentIndex = current.i % list.length;
                const nextIndex = (currentIndex + 1) % list.length;

                return {
                    i: nextIndex,
                    prev: list[currentIndex] ?? null,
                };
            });
        }, 2400);

        return () => clearInterval(id);
    }, [canRotate]);

    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), words[0] ?? "");

    const safeIndex = words.length > 0 ? state.i % words.length : 0;
    const curr = words[safeIndex] ?? "";
    const prev = state.prev;

    return (
        <span className="roulette">
            <span className="roulette__ghost" aria-hidden="true">
                {longest}
            </span>

            <span className="roulette__layer" aria-live="off">
                {prev ? (
                    <span key={"p" + state.i} className="roulette__out">
                        {prev}
                    </span>
                ) : null}

                <span key={"c" + state.i} className="roulette__in">
                    {curr}
                </span>
            </span>
        </span>
    );
}
