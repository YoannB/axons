"use client";
import MuiChip from "@mui/material/Chip";
import { isValidElement } from "react";
import type { AppChipProps } from "../types";

// Adapter boundary (docs/ui-material.md): THIS is where the type gap between
// the neutral API (icon?: ReactNode) and MUI (icon expects ReactElement | undefined) is absorbed.
// isValidElement is a type guard: it narrows ReactNode -> ReactElement when it is
// one, otherwise undefined. The resulting type is exactly what MUI expects, WITHOUT an `as` cast.
// (string / number / null / array => no icon, sane behavior.)
const COLOR_BG: Record<string, string> = {
    default: "color-mix(in oklab, var(--accent-1) 16%, transparent)",
    primary: "color-mix(in oklab, var(--accent-1) 16%, transparent)",
    info: "color-mix(in oklab, var(--accent-2) 16%, transparent)",
    success: "color-mix(in oklab, var(--ok) 18%, transparent)",
    warning: "color-mix(in oklab, #f59e0b 20%, transparent)",
    error: "color-mix(in oklab, var(--danger) 18%, transparent)",
    secondary: "color-mix(in oklab, var(--accent-2) 16%, transparent)",
};
const COLOR_BD: Record<string, string> = {
    default: "color-mix(in oklab, var(--accent-1) 42%, transparent)",
    primary: "color-mix(in oklab, var(--accent-1) 42%, transparent)",
    info: "color-mix(in oklab, var(--accent-2) 42%, transparent)",
    success: "color-mix(in oklab, var(--ok) 45%, transparent)",
    warning: "color-mix(in oklab, #f59e0b 48%, transparent)",
    error: "color-mix(in oklab, var(--danger) 45%, transparent)",
    secondary: "color-mix(in oklab, var(--accent-2) 42%, transparent)",
};

export function Chip({ label, color = "default", icon, onDelete }: AppChipProps) {
    const key = String(color ?? "default");
    return (
        <MuiChip
            label={label}
            color={
                color === "default"
                    ? "default"
                    : (color as "primary" | "secondary" | "error" | "info" | "success" | "warning")
            }
            variant="outlined"
            icon={isValidElement(icon) ? icon : undefined}
            onDelete={onDelete}
            size="small"
            sx={{
                justifySelf: "start",
                alignSelf: "start",
                background: COLOR_BG[key] ?? COLOR_BG.default,
                border: `1px solid ${COLOR_BD[key] ?? COLOR_BD.default}`,
                color: "var(--text-1)",
                fontWeight: 600,
                "& .MuiChip-icon, & .MuiChip-deleteIcon": { color: "inherit" },
            }}
        />
    );
}
