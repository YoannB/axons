// components/ui/Gauge.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Gauge } from "./Gauge";

const meta = {
    title: "UI/Gauge",
    component: Gauge,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Jauge circulaire SVG neutre (hors material). L'arc coloré suit `value`/`max` (stroke-dashoffset animé) ; une étincelle balaie en continu l'arc (classe .gauge__sheen, CSS neutre globals.css, principe btnSheen du Button). Le <svg> porte role=\"img\" + aria-label (libellé fourni ou pourcentage calculé) → accessible sans texte visible. Le survol renforce le halo (CSS, sans changement de géométrie). Couvre les bornes 0/100, les paliers intermédiaires, les tailles et le ratio personnalisé via max.",
            },
        },
    },
    argTypes: {
        value: {
            control: { type: "range", min: 0, max: 100, step: 1 },
            description: "Valeur courante (bornée à [0, max]).",
        },
        max: {
            control: { type: "number", min: 1 },
            description: "Valeur maximale (défaut 100).",
        },
        label: {
            control: "text",
            description: "Libellé accessible (aria-label) ; à défaut, le pourcentage calculé.",
        },
        size: {
            control: { type: "number", min: 48, max: 200, step: 8 },
            description: "Diamètre en pixels (défaut 96).",
        },
        tone: {
            control: "select",
            options: ["default", "success", "info", "warning", "error"],
            description:
                "Couleur de l'arc : `default` garde le dégradé d'accent, les autres une couleur d'état (paliers d'un score).",
        },
    },
    args: { value: 78, max: 100, size: 96 },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { label: "Progression" },
};

export const Empty: Story = {
    args: { value: 0, label: "Vide" },
};

export const Full: Story = {
    args: { value: 100, label: "Complet" },
};

export const CustomRatio: Story = {
    args: { value: 3, max: 10, label: "3 sur 10" },
};

export const Values: Story = {
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                alignItems: "center",
            }}
        >
            {[0, 25, 50, 75, 100].map((v) => (
                <Gauge key={v} {...args} value={v} label={`${v}%`} />
            ))}
        </div>
    ),
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {[64, 96, 128, 160].map((s) => (
                <Gauge key={s} {...args} size={s} label={`${s}px`} />
            ))}
        </div>
    ),
};

export const Tones: Story = {
    render: (args) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
            {(["default", "success", "info", "warning", "error"] as const).map((tone) => (
                <Gauge key={tone} {...args} tone={tone} label={tone} />
            ))}
        </div>
    ),
};
