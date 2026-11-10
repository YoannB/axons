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
                    "Icône SVG générique de l'API neutre (hors material). L'animation de dessin (contour fantôme + tracé via pathLength/stroke-dashoffset, cf. docs/seo-layout.md) est portée par le composant et son CSS neutre (globals.css) ; elle est indépendante de la couche material. Cette page sert aussi de preuve visuelle : les chips animés de la couche material consomment exactement ce composant via la prop `icon` (ReactNode transitée telle quelle).",
            },
        },
    },
    argTypes: {
        name: {
            control: "select",
            options: ICON_NAMES,
            description: "Nom de l'icône (union IconName).",
        },
        size: {
            control: { type: "number", min: 12, max: 64, step: 2 },
            description: "Taille en pixels (carré).",
        },
        animated: {
            control: "boolean",
            description: "Active le cycle de dessin (classe .ui-icon--animated).",
        },
        className: {
            control: "text",
            description: "Classe additionnelle optionnelle.",
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
