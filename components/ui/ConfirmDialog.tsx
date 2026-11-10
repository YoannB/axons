// components/ui/ConfirmDialog.tsx
"use client";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import type { AppConfirmProps } from "./types";

// Neutral composition (Dialog + Button): reusable whatever the adapter.
export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone = "primary",
}: AppConfirmProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {cancelLabel ?? "Annuler"}
                    </Button>
                    <Button
                        variant={tone === "danger" ? "secondary" : "primary"}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmLabel ?? "Confirmer"}
                    </Button>
                </>
            }
        >
            {message}
        </Dialog>
    );
}
