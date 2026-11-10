// components/ui/DiffView.tsx — read-only rendering of a word diff (generic, no MUI)
"use client";
import { cn } from "@/lib/cn";
import type { AppDiffLegendProps, AppDiffViewProps } from "./types";

// The ops come from lib/text/diff (pure). Rendering is plain React text nodes inside
// <ins>/<del>/<mark>: NEVER innerHTML, so a model reply can never inject markup.
// Fixed height from `rows` (same line box as the Textarea) so a Textarea and a DiffView
// with the same `rows` line up side by side; overflow scrolls.
export function DiffView({
    ops,
    ariaLabel,
    placeholder,
    hideDeletions = false,
    labels,
    rows = 8,
    id,
    className,
}: AppDiffViewProps) {
    const empty = ops.length === 0;
    return (
        <div
            id={id}
            role="region"
            aria-label={ariaLabel}
            tabIndex={0}
            className={cn("diff-view", empty && "diff-view--empty", className)}
            style={{ height: `calc(${rows} * 1.4375em + 33px)` }}
        >
            {empty ? (
                <span className="diff-view__placeholder">{placeholder}</span>
            ) : (
                ops.map((op, k) => {
                    if (op.type === "equal") return <span key={k}>{op.text}</span>;
                    if (op.type === "insert")
                        return (
                            <ins key={k} className="diff diff--insert" title={labels?.insert}>
                                {op.text}
                            </ins>
                        );
                    if (op.type === "delete")
                        return hideDeletions ? null : (
                            <del key={k} className="diff diff--delete" title={labels?.delete}>
                                {op.text}
                            </del>
                        );
                    return (
                        <mark
                            key={k}
                            className="diff diff--replace"
                            title={labels ? `${labels.replace}: ${op.old}` : op.old}
                        >
                            {op.text}
                        </mark>
                    );
                })
            )}
        </div>
    );
}

// Color key matching DiffView's highlight classes.
export function DiffLegend({ labels, className }: AppDiffLegendProps) {
    return (
        <ul className={cn("diff-legend", className)}>
            <li>
                <span className="diff-legend__swatch diff--insert" aria-hidden="true" />
                {labels.insert}
            </li>
            <li>
                <span className="diff-legend__swatch diff--replace" aria-hidden="true" />
                {labels.replace}
            </li>
            <li>
                <span className="diff-legend__swatch diff--delete" aria-hidden="true" />
                {labels.delete}
            </li>
        </ul>
    );
}
