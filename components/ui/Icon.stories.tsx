// components/ui/Icon.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./Icon";
import type { IconName } from "./types";

const ICON_NAMES: IconName[] = [
    "star",
    "bolt",
    "heart",
    "shield",
    "clock",
    "globe",
    "palette",
    "cookie",
    "box",
    "sparkles",
    "check",
    "rocket",
    "link",
    "code",
];

const meta = {
    title: "UI/Icon",
    component: Icon,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Generic SVG icon of the neutral API (outside material). The drawing animation (ghost outline + stroke via pathLength/stroke-dashoffset, see docs/seo-layout.md) is carried by the component and its neutral CSS (globals.css); it is independent of the material layer. This page is also visual proof: the material layer's animated chips consume exactly this component through the `icon` prop (ReactNode passed through as is).",
            },
        },
    },
    argTypes: {
        name: {
            control: "select",
            options: ICON_NAMES,
            description: "Icon name (IconName union).",
        },
        size: {
            control: { type: "number", min: 12, max: 64, step: 2 },
            description: "Size in pixels (square).",
        },
        animated: {
            control: "boolean",
            description: "Enables the drawing cycle (.ui-icon--animated class).",
        },
        className: {
            control: "text",
            description: "Optional extra class.",
        },
    },
    args: { name: "check", size: 24, animated: false },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Animated: Story = {
    args: { animated: true },
};

export const AllStatic: Story = {
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "center",
            }}
        >
            {ICON_NAMES.map((n) => (
                <span key={n} title={n} style={{ display: "grid", placeItems: "center", gap: 4 }}>
                    <Icon {...args} name={n} animated={false} />
                    <small style={{ color: "var(--muted, #7c8aa8)", fontSize: "0.7rem" }}>{n}</small>
                </span>
            ))}
        </div>
    ),
};

export const AllAnimated: Story = {
    render: (args) => (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "center",
            }}
        >
            {ICON_NAMES.map((n) => (
                <span key={n} title={n} style={{ display: "grid", placeItems: "center", gap: 4 }}>
                    <Icon {...args} name={n} animated />
                    <small style={{ color: "var(--muted, #7c8aa8)", fontSize: "0.7rem" }}>{n}</small>
                </span>
            ))}
        </div>
    ),
};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
            {[16, 24, 32, 48].map((s) => (
                <Icon key={s} {...args} size={s} animated />
            ))}
        </div>
    ),
};
