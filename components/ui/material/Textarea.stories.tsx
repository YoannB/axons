// components/ui/material/Textarea.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Textarea } from "../Textarea";
import type { AppTextareaProps } from "../types";

const noop = () => {};

/** Same parity pattern as Input: FIXED external label (it carries the
 *  asterisk), inner label neutralized; single focus ring and MUI asterisk
 *  hidden via material/index.css. */
type LabeledTextareaProps = Omit<AppTextareaProps, "label" | "onChange"> & {
    label?: string;
    onChange?: (v: string) => void;
};

function LabeledTextarea({
    label: externalLabel,
    value: initialValue = "",
    onChange,
    required,
    ...rest
}: LabeledTextareaProps) {
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
            <Textarea {...rest} required={required} label=" " value={value} onChange={handleChange} />
        </div>
    );
}

const meta = {
    title: "UI/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Neutral text area. Interface parity: FIXED external label (it carries the `required` asterisk), inner label neutralized; single rotating ring on focus. Covers placeholder, required, disabled, helper text, error, error/helperText priority and heights via rows.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Text of the FIXED external label." },
        value: { control: "text", description: "Initial value." },
        placeholder: { control: "text", description: "Placeholder when empty." },
        disabled: { control: "boolean", description: "Disables the area." },
        required: {
            control: "boolean",
            description: "Required marker (external asterisk + native attribute).",
        },
        error: {
            control: "text",
            description: "Error message (takes precedence over helperText).",
        },
        helperText: { control: "text", description: "Helper text when there is no error." },
        rows: {
            control: { type: "number", min: 2, max: 12 },
            description: "Visible lines.",
        },
        id: {
            control: "text",
            description: "DOM id (association/tests).",
        },
        name: { control: "text", description: "Field name (forms)." },
        maxLength: {
            control: { type: "number", min: 10, max: 5000 },
            description: "Native character limit.",
        },
        showCount: {
            control: "boolean",
            description: 'Shows the "n / maxLength" counter under the field (requires maxLength).',
        },
        readOnly: {
            control: "boolean",
            description: "Focusable and selectable but not editable (≠ disabled).",
        },
        onChange: {
            table: { disable: true },
            description: "Disabled: local demo state.",
        },
    },
    args: { label: "Comment", value: "", rows: 4, onChange: noop },
    render: (args) => <LabeledTextarea key={String(args.value)} {...args} />,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Comment",
        placeholder: "Enter your feedback…",
        helperText: "You can use several lines.",
    },
};
export const Required: Story = {
    args: {
        label: "Message",
        required: true,
        placeholder: "Your message is required.",
        helperText: "This field must be filled in.",
    },
};
export const Disabled: Story = {
    args: {
        label: "Internal note",
        value: "This area is read-only.",
        disabled: true,
        helperText: "Only an administrator can change it.",
    },
};
export const HelperText: Story = {
    args: {
        label: "Project description",
        placeholder: "Briefly describe your project.",
        helperText: "500 characters maximum.",
    },
};
export const Error: Story = {
    args: { label: "Message", value: "", error: "The message is required." },
};
export const ErrorOverridesHelperText: Story = {
    args: {
        label: "Comment",
        value: "Incomplete draft",
        error: "The comment must contain at least 10 characters.",
        helperText: "This hint must not show when an error is present.",
    },
};
export const Compact: Story = {
    args: {
        label: "Summary",
        rows: 2,
        placeholder: "Two lines are sometimes enough.",
    },
};
export const Expanded: Story = {
    args: {
        label: "Long notes",
        rows: 8,
        placeholder: "You have more room.",
        helperText: "Height increased via rows.",
    },
};
export const LongContent: Story = {
    args: {
        label: "History",
        rows: 6,
        value: "First line of context.\n\nSecond paragraph after a line break.\n\nThird item to check multi-line rendering, possible scrolling and text readability.",
    },
};
export const FormAttributes: Story = {
    args: {
        id: "feedback-message",
        name: "message",
        label: "Your feedback",
        placeholder: "Share your experience…",
        helperText: "These attributes ease integration into a form.",
    },
};
export const RowsComparison: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: "1rem", maxWidth: "520px" }}>
            <LabeledTextarea {...args} id="textarea-rows-2" label="rows = 2" rows={2} />
            <LabeledTextarea {...args} id="textarea-rows-4" label="rows = 4" rows={4} />
            <LabeledTextarea {...args} id="textarea-rows-8" label="rows = 8" rows={8} />
        </div>
    ),
    args: { placeholder: "Demo text area." },
};
export const WithCounter: Story = {
    args: {
        label: "Post",
        maxLength: 280,
        showCount: true,
        placeholder: "280 characters maximum, counter under the field.",
    },
};
export const CounterFull: Story = {
    args: {
        label: "Post",
        maxLength: 40,
        showCount: true,
        value: "This text reaches the limit exactly!!!!!",
        helperText: "The counter switches to the alert color at the limit.",
    },
};
export const ReadOnly: Story = {
    args: {
        label: "Result",
        readOnly: true,
        value: "Text returned by the tool: selectable and copyable, but not editable.",
    },
};
