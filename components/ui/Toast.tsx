// components/ui/Toast.tsx  (view of one toast; stacking/animation is handled by the adapter)
"use client";
import { Toast as MuiToast } from "./material/Toast";
import type { AppToastView } from "./types";

export function Toast(view: AppToastView) {
    return <MuiToast {...view} />;
}
