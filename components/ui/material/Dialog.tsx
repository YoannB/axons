"use client";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslations } from "next-intl";
import type { AppDialogProps } from "../types";

// Animated close button (drawn on mount + rotation on hover, see material/index.css).
// ConfirmDialog composes Dialog => inherits the close button with no extra code.
export function Dialog({ open, onClose, title, children, footer }: AppDialogProps) {
    const tc = useTranslations("showcase");
    return (
        <MuiDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <button type="button" className="dialog-close" onClick={onClose} aria-label={tc("dialogClose")}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" pathLength={1} />
                </svg>
            </button>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent dividers>{children}</DialogContent>
            {footer && <DialogActions>{footer}</DialogActions>}
        </MuiDialog>
    );
}
