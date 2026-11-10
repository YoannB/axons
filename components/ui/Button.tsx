// components/ui/Button.tsx
"use client";
import { Button as MuiButton } from "./material/Button";
import type { AppButtonProps } from "./types";

export function Button(props: AppButtonProps) {
    return <MuiButton {...props} />;
}
