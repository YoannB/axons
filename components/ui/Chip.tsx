// components/ui/Chip.tsx
"use client";
import { Chip as MuiChip } from "./material/Chip";
import type { AppChipProps } from "./types";

export function Chip(props: AppChipProps) {
    return <MuiChip {...props} />;
}
