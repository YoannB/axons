// components/ui/Input.tsx
"use client";
import { Input as MuiInput } from "./material/Input";
import type { AppInputProps } from "./types";

export function Input(props: AppInputProps) {
    return <MuiInput {...props} />;
}
