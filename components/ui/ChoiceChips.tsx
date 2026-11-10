// components/ui/ChoiceChips.tsx
"use client";
import { ChoiceChips as MuiChoiceChips } from "./material/ChoiceChips";
import type { AppChoiceChipsProps } from "./types";

export function ChoiceChips<V extends string>(props: AppChoiceChipsProps<V>) {
    return <MuiChoiceChips {...props} />;
}
