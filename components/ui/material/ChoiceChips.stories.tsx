// components/ui/material/ChoiceChips.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ChoiceChips } from "../ChoiceChips";

const OPTIONS = [
    { value: "linkedin", label: "Post LinkedIn" },
    { value: "email", label: "E-mail pro" },
    { value: "long", label: "Texte long" },
] as const;
type Value = (typeof OPTIONS)[number]["value"];

function Demo({ initial, disabled }: { initial: Value | null; disabled?: boolean }) {
    const [value, setValue] = useState<Value | null>(initial);
    return (
        <div style={{ display: "grid", gap: 8 }}>
            <ChoiceChips ariaLabel="Exemples" options={OPTIONS} value={value} onChange={setValue} disabled={disabled} />
            <small style={{ color: "var(--muted)" }}>Sélection : {value ?? "aucune"}</small>
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
                    "Groupe de puces à choix unique (exemples, préréglages, modes). Accessibilité : `role=radiogroup` + `role=radio`/`aria-checked`, tabindex itinérant (Tab entre sur la puce sélectionnée, les flèches déplacent ET sélectionnent, Espace/Entrée sélectionnent). `disabled` gèle le groupe pendant un appel IA.",
            },
        },
    },
    args: { options: OPTIONS, value: null, onChange: () => {}, ariaLabel: "Exemples" },
} satisfies Meta<typeof ChoiceChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = { render: () => <Demo initial="linkedin" /> };
export const NoneSelected: Story = { render: () => <Demo initial={null} /> };
export const Disabled: Story = { render: () => <Demo initial="email" disabled /> };
