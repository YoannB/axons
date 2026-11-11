// components/ui/material/Input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "../Input";
import type { AppInputProps } from "../types";

const noop = () => {};

/**
 * Interface parity: FIXED external label (the .fld > label pattern of
 * ComponentShowcase), inner label neutralized (`label=" "`). The decorative
 * ring and the MUI asterisk are handled in the material CSS (index.css):
 * the MUI outline is hidden on focus (no more double border) and the MUI
 * asterisk is hidden in .mui-field. `required` is still passed to the facade
 * (native attribute + aria-required on the input); the VISUAL asterisk is carried
 * by the external label, in red, aria-hidden (the semantics are already on
 * the input). `onChange` is optional on the wrapper, always provided to the facade.
 */
type LabeledInputProps = Omit<AppInputProps, "label" | "onChange"> & {
    label?: string;
    onChange?: (v: string) => void;
};

function LabeledInput({
    label: externalLabel,
    value: initialValue = "",
    onChange,
    required,
    ...rest
}: LabeledInputProps) {
    const [value, setValue] = useState(initialValue);
    const handleChange = (v: string) => {
        setValue(v);
        onChange?.(v);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            {externalLabel ? (
                <label
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--muted, #7c8aa8)",
                        lineHeight: 1.2,
                    }}
                >
                    {externalLabel}
                    {required ? (
                        <span aria-hidden="true" style={{ color: "var(--danger, #ff5470)", marginLeft: 2 }}>
                            *
                        </span>
                    ) : null}
                </label>
            ) : null}
            {/* required passed to the facade (a11y); its MUI asterisk is hidden by index.css */}
            <Input {...rest} required={required} label=" " value={value} onChange={handleChange} />
        </div>
    );
}

const meta = {
    title: "UI/Input",
    component: Input,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Neutral input field. Interface parity: FIXED external label (it carries the `required` asterisk), inner label neutralized. The rotating ring is the only focus outline (the MUI outline is hidden in the material CSS, no more double border). Covers placeholder, required, disabled, helper text, error, error/helperText priority and native HTML types.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Text of the FIXED external label." },
        value: { control: "text", description: "Initial value." },
        placeholder: { control: "text", description: "Placeholder when empty." },
        disabled: { control: "boolean", description: "Disables the field." },
        required: {
            control: "boolean",
            description: "Required marker (asterisk on the external label + native attribute).",
        },
        error: {
            control: "text",
            description: "Error message (takes precedence over helperText).",
        },
        helperText: { control: "text", description: "Helper text when there is no error." },
        type: {
            control: "select",
            options: ["text", "email", "password", "number", "search", "tel", "url"],
            description: "Native HTML type.",
        },
        id: {
            control: "text",
            description: "DOM id (association/tests).",
        },
        name: { control: "text", description: "Field name (forms)." },
        onChange: {
            table: { disable: true },
            description: "Disabled: local demo state.",
        },
    },
    args: { label: "Label", value: "", onChange: noop },
    render: (args) => <LabeledInput key={String(args.value)} {...args} />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Full name",
        placeholder: "Jane Doe",
        helperText: "Enter your first and last name.",
    },
};
export const Required: Story = {
    args: {
        label: "Email address",
        type: "email",
        required: true,
        helperText: "This field is required.",
    },
};
export const Disabled: Story = {
    args: {
        label: "Username",
        value: "USER-123",
        disabled: true,
        helperText: "Only an administrator can change it.",
    },
};
export const HelperText: Story = {
    args: {
        label: "Project title",
        placeholder: "My project",
        helperText: "50 characters maximum.",
    },
};
export const Error: Story = {
    args: {
        label: "Email address",
        type: "email",
        value: "jane.example",
        error: "Invalid email format.",
    },
};
export const ErrorOverridesHelperText: Story = {
    args: {
        label: "Password",
        type: "password",
        error: "The password is required.",
        helperText: "This hint must not show when an error is present.",
    },
};
export const Password: Story = {
    args: {
        label: "Password",
        type: "password",
        placeholder: "••••••••",
        helperText: "8 characters minimum.",
    },
};
export const Search: Story = {
    args: {
        label: "Search",
        type: "search",
        placeholder: "Search for an article…",
    },
};
export const FormAttributes: Story = {
    args: {
        id: "company-website",
        name: "website",
        label: "Website",
        type: "url",
        placeholder: "https://example.com",
        helperText: "Include the https:// protocol.",
    },
};
export const Types: Story = {
    render: () => (
        <div style={{ display: "grid", gap: "1rem", maxWidth: "420px" }}>
            <LabeledInput id="input-text" label="Text" type="text" value="Free text" />
            <LabeledInput id="input-email" label="Email" type="email" value="user@example.com" />
            <LabeledInput id="input-password" label="Password" type="password" value="secret" />
            <LabeledInput id="input-number" label="Number" type="number" value="42" />
            <LabeledInput id="input-search" label="Search" type="search" placeholder="Search…" value="" />
            <LabeledInput id="input-tel" label="Phone" type="tel" value="+33123456789" />
            <LabeledInput id="input-url" label="URL" type="url" value="https://example.com" />
        </div>
    ),
};
