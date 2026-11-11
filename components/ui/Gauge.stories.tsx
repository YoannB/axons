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
                    'Neutral circular SVG gauge (outside material). The colored arc follows `value`/`max` (animated stroke-dashoffset); a sparkle continuously sweeps the arc (.gauge__sheen class, neutral CSS in globals.css, same principle as the Button\'s btnSheen). The <svg> carries role="img" + aria-label (given label or computed percentage) → accessible without visible text. Hover strengthens the glow (CSS, no geometry change). Covers the 0/100 bounds, intermediate steps, sizes and a custom ratio via max.',
            },
        },
    },
    argTypes: {
        value: {
            control: { type: "range", min: 0, max: 100, step: 1 },
            description: "Current value (clamped to [0, max]).",
        },
        max: {
            control: { type: "number", min: 1 },
            description: "Maximum value (default 100).",
        },
        label: {
            control: "text",
            description: "Accessible label (aria-label); otherwise, the computed percentage.",
        },
        size: {
            control: { type: "number", min: 48, max: 200, step: 8 },
            description: "Diameter in pixels (default 96).",
        },
        tone: {
            control: "select",
            options: ["default", "success", "info", "warning", "error"],
            description: "Arc color: `default` keeps the accent gradient, the others a status color (score steps).",
        },
    },
    args: { value: 78, max: 100, size: 96 },
} satisfies Meta<typeof Gauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { label: "Progress" },
};

export const Empty: Story = {
    args: { value: 0, label: "Empty" },
};

export const Full: Story = {
    args: { value: 100, label: "Complete" },
};

export const CustomRatio: Story = {
    args: { value: 3, max: 10, label: "3 out of 10" },
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
