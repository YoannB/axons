"use client";
import MuiChip from "@mui/material/Chip";
import type { KeyboardEvent } from "react";
import type { AppChoiceChipsProps } from "../types";

// Single-choice chip group (examples, presets, modes). Accessibility: a radiogroup with a
// roving tabindex (WAI-ARIA radio pattern): Tab lands on the selected chip, arrows move AND
// select, Space/Enter select (MUI's clickable Chip handles those two keys).
const STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function ChoiceChips<V extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    disabled,
    className,
}: AppChoiceChipsProps<V>) {
    const selectedIndex = options.findIndex((o) => o.value === value);
    const focusIndex = selectedIndex === -1 ? 0 : selectedIndex;
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const delta = STEP[e.key];
        if (!delta || disabled || options.length === 0) return;
        e.preventDefault();
        const next = (focusIndex + delta + options.length) % options.length;
        onChange(options[next].value);
        // Focus follows the selection (same list, so the node exists).
        e.currentTarget.querySelectorAll<HTMLElement>("[role='radio']")[next]?.focus();
    };
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            aria-disabled={disabled || undefined}
            className={className ? `choice-chips ${className}` : "choice-chips"}
            onKeyDown={onKeyDown}
        >
            {options.map((o, k) => {
                const selected = o.value === value;
                return (
                    <MuiChip
                        key={o.value}
                        role="radio"
                        aria-checked={selected}
                        tabIndex={k === focusIndex && !disabled ? 0 : -1}
                        label={o.label}
                        clickable
                        disabled={disabled}
                        onClick={() => onChange(o.value)}
                        variant={selected ? "filled" : "outlined"}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            color: "var(--text-1)",
                            border: "1px solid",
                            borderColor: selected
                                ? "color-mix(in oklab, var(--accent-1) 70%, transparent)"
                                : "var(--border-2)",
                            background: selected
                                ? "color-mix(in oklab, var(--accent-1) 24%, transparent)"
                                : "transparent",
                            "&:hover": { background: "color-mix(in oklab, var(--accent-1) 14%, transparent)" },
                            "&.Mui-focusVisible": { outline: "2px solid var(--accent-2)", outlineOffset: 2 },
                        }}
                    />
                );
            })}
        </div>
    );
}
