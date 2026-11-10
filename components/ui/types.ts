import type { DiffOp } from "@/lib/text/diff";
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
    /** Visible lines. The height is FIXED (no auto-grow), so two areas with the same `rows` align. */
    rows?: number;
    /** Hard cap on the number of characters (native maxlength). */
    maxLength?: number;
    /** Shows a "n / maxLength" counter under the field (requires `maxLength`). */
    showCount?: boolean;
    /** Focusable and selectable but not editable (unlike `disabled`). */
    readOnly?: boolean;
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
export type AppTone = "default" | "success" | "info" | "warning" | "error";
export interface AppGaugeProps {
    value: number;
    max?: number;
    label?: string;
    size?: number;
    /** Arc color. `default` keeps the accent gradient; the others map to a status color. */
    tone?: AppTone;
}
export interface AppDiffLabels {
    insert: string;
    delete: string;
    replace: string;
}
export interface AppDiffViewProps {
    /** Ops from lib/text/diff (diffWords). Empty => the placeholder is shown. */
    ops: DiffOp[];
    /** Accessible name of the read-only region. */
    ariaLabel: string;
    /** Shown when `ops` is empty (e.g. "Run the tool to see the result"). */
    placeholder?: ReactNode;
    /** Hide deleted text (show the "after" text only, insertions/replacements highlighted). */
    hideDeletions?: boolean;
    /** Tooltip prefixes; a replace tooltip reads "<replace>: <old text>". */
    labels?: AppDiffLabels;
    /** Visible lines, aligned with a Textarea of the same `rows` (fixed height, scrolls). */
    rows?: number;
    id?: string;
    className?: string;
}
export interface AppDiffLegendProps {
    labels: AppDiffLabels;
    className?: string;
}
export interface AppChoiceOption<V extends string = string> {
    value: V;
    label: ReactNode;
}
export interface AppChoiceChipsProps<V extends string = string> {
    options: readonly AppChoiceOption<V>[];
    /** Selected value, or null for none. */
    value: V | null;
    onChange: (value: V) => void;
    /** Accessible name of the radio group. */
    ariaLabel: string;
    disabled?: boolean;
    className?: string;
}
export interface AppEditorPairProps {
    /** Source side (usually a Textarea). */
    start: ReactNode;
    /** Result side (usually a DiffView or a read-only Textarea). */
    end: ReactNode;
    /** Optional toolbar above each side (example chips, copy button...). */
    startToolbar?: ReactNode;
    endToolbar?: ReactNode;
    /** Optional action rendered between the sides (stacked: under `start`). */
    action?: ReactNode;
    /** id of the result column, the scroll target after a call on small screens. */
    endId?: string;
    className?: string;
}
export interface AppAiNoticeProps {
    /** One line each (already translated): provider disclosure, quality caveat, wait time... */
    items: ReactNode[];
    className?: string;
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
