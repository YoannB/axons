// components/ui/material/ChoiceChips.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChoiceChips } from "../ChoiceChips";

const OPTIONS = [
    { value: "linkedin", label: "LinkedIn post" },
    { value: "email", label: "Work email" },
    { value: "long", label: "Long text" },
] as const;
type Value = (typeof OPTIONS)[number]["value"];

function Demo({ initial, disabled }: { initial: Value | null; disabled?: boolean }) {
    const [value, setValue] = useState<Value | null>(initial);
    return (
        <div style={{ display: "grid", gap: 8 }}>
            <ChoiceChips ariaLabel="Examples" options={OPTIONS} value={value} onChange={setValue} disabled={disabled} />
            <small style={{ color: "var(--muted)" }}>Selection: {value ?? "none"}</small>
        </div>
    );
}

const meta = {
    title: "UI/ChoiceChips",
    component: ChoiceChips,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Single-choice chip group (examples, presets, modes). Accessibility: `role=radiogroup` + `role=radio`/`aria-checked`, roving tabindex (Tab enters on the selected chip, arrows move AND select, Space/Enter select). `disabled` freezes the group during an AI call.",
            },
        },
    },
    args: { options: OPTIONS, value: null, onChange: () => {}, ariaLabel: "Examples" },
} satisfies Meta<typeof ChoiceChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = { render: () => <Demo initial="linkedin" /> };
export const NoneSelected: Story = { render: () => <Demo initial={null} /> };
export const Disabled: Story = { render: () => <Demo initial="email" disabled /> };
