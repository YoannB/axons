// components/ui/Dialog.tsx
"use client";
import { Dialog as MuiDialog } from "./material/Dialog";
import type { AppDialogProps } from "./types";

export function Dialog(props: AppDialogProps) {
    return <MuiDialog {...props} />;
}
