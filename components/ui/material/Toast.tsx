"use client";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import type { CSSProperties } from "react";
import type { AppToastView } from "../types";
// Anchored BOTTOM-LEFT: the sticky video occupies the bottom right (right:24/bottom:24),
// toasts used to overlap it. The vertical offset that avoids the Netlify badge is set in CSS
// (material/index.css, .MuiSnackbar-anchorOriginBottomLeft).
// data-severity: NEUTRAL attribute set by the facade, targeted by material/index.css
// for the severity background color (robust against MUI's internal .MuiAlert-filled*
// classes, whose generation changes across versions).
// showProgress: opt-in countdown bar, rendered as the .toast-with-progress pseudo-element
// (::after + @keyframes toastProgress in material/index.css, same approach as
// .dialog-close / btnSheen: sx cannot define @keyframes). --toast-duration is
// set here and aligns the bar duration with Snackbar's autoHideDuration (same
// origin = mount, same duration).
export function Toast({ id, severity, message, duration = 4000, showProgress = false, onDismiss }: AppToastView) {
    return (
        <Snackbar
            open
            autoHideDuration={duration}
            onClose={() => onDismiss(id)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
            <MuiAlert
                severity={severity}
                variant="filled"
                onClose={() => onDismiss(id)}
                className={showProgress ? "toast-with-progress" : undefined}
                style={{ "--toast-duration": `${duration}ms` } as CSSProperties}
                sx={{ width: "100%" }}
                data-testid="app-toast"
                data-severity={severity}
            >
                {message}
            </MuiAlert>
        </Snackbar>
    );
}
