// components/ui/ToastRegion.tsx  (reads the neutral store, renders neutral Toasts)
"use client";
import { useStore, useToasts } from "@/hooks/use-store";
import { Toast } from "./Toast";

export function ToastRegion() {
    const toasts = useToasts();
    const store = useStore();
    return (
        <div className="toast-region" role="region" aria-label="Notifications" aria-live="polite">
            {toasts.map((t) => (
                <Toast
                    key={t.id}
                    id={t.id}
                    severity={t.severity}
                    message={t.message}
                    duration={t.duration}
                    onDismiss={(id) => store.dismissToast(id)}
                />
            ))}
        </div>
    );
}
