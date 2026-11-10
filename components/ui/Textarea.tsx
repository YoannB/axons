// components/ui/Textarea.tsx
"use client";
import { Textarea as MuiTextarea } from "./material/Textarea";
import type { AppTextareaProps } from "./types";

export function Textarea(props: AppTextareaProps) {
    return <MuiTextarea {...props} />;
}
