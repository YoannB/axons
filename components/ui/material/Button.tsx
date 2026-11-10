"use client";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import type { AppButtonProps } from "../types";

const VARIANT = {
    primary: "contained",
    secondary: "outlined",
    ghost: "text",
} as const;

const SIZE = { sm: "small", md: "medium", lg: "large" } as const;

// NO transform on :hover: moving the box changes the pointer hit area and
// creates an endless oscillation (hover -> translate -> mouse out -> un-hover -> ...).
// Hover strengthens the shadow + lightens, and STOPS the halo animation (otherwise the animation
// drives box-shadow and would override the static hover shadow). The btnShift/
// btnHalo/btnSheen keyframes live in material/index.css (sx cannot define @keyframes).
export function Button({
    variant = "primary",
    size = "md",
    disabled,
    loading,
    fullWidth,
    type = "button",
    onClick,
    iconLeft,
    iconRight,
    ariaLabel,
    children,
    className,
    id,
}: AppButtonProps) {
    const isPrimary = variant === "primary";
    return (
        <MuiButton
            id={id}
            className={className}
            variant={VARIANT[variant]}
            size={SIZE[size]}
            color="primary"
            disabled={disabled || loading}
            fullWidth={fullWidth}
            type={type}
            onClick={onClick}
            aria-label={ariaLabel}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : iconLeft}
            endIcon={iconRight}
            sx={{
                position: "relative",
                overflow: "hidden",
                textTransform: "none",
                fontWeight: 700,
                backgroundImage: isPrimary
                    ? "linear-gradient(120deg,var(--accent-1),var(--accent-2),var(--accent-1))"
                    : undefined,
                backgroundSize: isPrimary ? "220% 100%" : undefined,
                animation:
                    isPrimary && !disabled
                        ? "btnShift 7s ease-in-out infinite, btnHalo 3.4s ease-in-out infinite"
                        : undefined,
                transition: "box-shadow .25s ease, filter .2s ease",
                "&:not(:disabled):hover": isPrimary
                    ? {
                          animation: "none",
                          boxShadow: "0 12px 34px color-mix(in oklab, var(--accent-1) 50%, transparent)",
                          filter: "brightness(1.06)",
                      }
                    : { boxShadow: "0 8px 22px rgba(0,0,0,.28)" },
                // DISABLED STATE, VARIANTS WITHOUT A PAINTED BACKGROUND (outlined = secondary, text = ghost):
                // MUI applies opacity .38 to the primary color (#7c5cff), which on a light background
                // (light --bg-0 #dfe5f0, or a white surface in an app) drops to ~1.5:1 => ghost
                // button (see the Disabled/Light story). The contained (primary) variant is EXCLUDED from this
                // selector: MUI already paints a grey background there that ensures contrast; leaving it
                // as is avoids degrading its rendering. Specificity 0,3,0 > 0,2,0 of MUI's
                // disabled styles => wins WITHOUT !important. var() resolved at runtime (not a channel
                // derived by MUI) => identical server/client => no hydration mismatch,
                // and follows both themes (readable grey on light as on dark).
                "&.MuiButton-outlined.Mui-disabled, &.MuiButton-text.Mui-disabled": {
                    color: "var(--muted)",
                    borderColor: "var(--border-2)",
                    opacity: 1,
                },
                "&::after":
                    isPrimary && !disabled
                        ? {
                              content: '" "',
                              position: "absolute",
                              inset: 0,
                              pointerEvents: "none",
                              background:
                                  "linear-gradient(115deg, transparent 35%, rgba(255,255,255,.42) 50%, transparent 65%)",
                              transform: "translateX(-130%)",
                              animation: "btnSheen 3.6s ease-in-out infinite",
                          }
                        : undefined,
            }}
        >
            {children}
        </MuiButton>
    );
}
