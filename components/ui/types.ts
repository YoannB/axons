import type { ReactNode } from "react";
// CLEAN application types: no sx, classes or MUI types cross this API.
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export interface AppButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
    ariaLabel?: string;
    children?: ReactNode;
    className?: string;
    id?: string;
}
export interface AppFieldProps {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    error?: string;
    helperText?: string;
    id?: string;
    name?: string;
    required?: boolean;
}
export interface AppInputProps extends AppFieldProps {
    type?: string;
}
export interface AppTextareaProps extends AppFieldProps {
    rows?: number;
}
export interface AppDialogProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
}
export interface AppConfirmProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: ReactNode;
    message?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "primary" | "danger";
}
export interface AppToastView {
    id: string;
    severity: "success" | "info" | "warning" | "error";
    message: string;
    duration?: number;
    showProgress?: boolean;
    onDismiss: (id: string) => void;
}
export interface AppBreadcrumbItem {
    label: string;
    href?: string;
}
export interface AppChipProps {
    label: ReactNode;
    color?: "default" | "success" | "info" | "warning" | "error";
    icon?: ReactNode;
    onDelete?: () => void;
}
export interface AppGaugeProps {
    value: number;
    max?: number;
    label?: string;
    size?: number;
}
export type IconName =
    | "star"
    | "bolt"
    | "heart"
    | "shield"
    | "clock"
    | "globe"
    | "palette"
    | "cookie"
    | "box"
    | "sparkles"
    | "check"
    | "rocket"
    | "link"
    | "code";
export interface AppIconProps {
    name: IconName;
    size?: number;
    animated?: boolean;
    className?: string;
}
