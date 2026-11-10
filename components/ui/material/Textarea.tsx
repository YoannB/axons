// components/ui/material/Textarea.tsx
"use client";
import TextField from "@mui/material/TextField";
import type { AppTextareaProps } from "../types";
export function Textarea({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    error,
    helperText,
    id,
    name,
    required,
    rows = 4,
}: AppTextareaProps) {
    return (
        <div className="mui-field">
            <TextField
                fullWidth
                multiline
                required={required}
                disabled={disabled}
                id={id}
                name={name}
                label={label}
                placeholder={placeholder}
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                error={!!error}
                helperText={error ?? helperText}
                slotProps={{ inputLabel: { shrink: !!value || undefined } }}
            />
        </div>
    );
}
