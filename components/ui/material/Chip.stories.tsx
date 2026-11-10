// components/ui/material/Chip.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
// RELATIVE import (not the '@' alias, which is not declared in Storybook's Vite config).
// Icon is a neutral component; Chip passes it through as is (ReactNode) → the animation
// is carried by Icon + globals.css, with no extra layer and no MUI leak.
import { Chip } from "../Chip";
import { Icon } from "../Icon";

const meta = {
    title: "UI/Chip",
    component: Chip,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Puce neutre de la couche material. Couleurs sémantiques publiques conformes à AppChipProps (default | info | success | warning | error — primary/secondary ne font PAS partie de l'API). Icône optionnelle animée via le composant neutre Icon (transité tel quel). Suppression via onDelete, labels longs, barre de filtres.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Texte affiché dans la puce." },
        color: {
            control: "select",
            options: ["default", "info", "success", "warning", "error"],
            description: "Couleur sémantique publique (AppChipProps).",
        },
        icon: {
            table: { disable: true },
            description: "Icône optionnelle (ReactNode). Passer <Icon animated /> pour l'animation.",
        },
        onDelete: {
            table: { disable: true },
            description: "Callback de suppression. Absent ⇒ puce non supprimable.",
        },
    },
    args: { label: "Composant", color: "default" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Info: Story = { args: { color: "info", label: "Information" } };
export const Success: Story = { args: { color: "success", label: "Succès" } };
export const Warning: Story = {
    args: { color: "warning", label: "Attention" },
};
export const Error: Story = { args: { color: "error", label: "Erreur" } };

export const WithAnimatedIcon: Story = {
    args: {
        color: "success",
        label: "Vérifié",
        icon: <Icon name="check" size={14} animated />,
    },
};

export const Deletable: Story = {
    args: { color: "info", label: "Filtre actif", onDelete: () => {} },
};

export const DeletableWithAnimatedIcon: Story = {
    args: {
        color: "warning",
        label: "À vérifier",
        icon: <Icon name="bolt" size={14} animated />,
        onDelete: () => {},
    },
};

export const LongLabel: Story = {
    args: {
        color: "info",
        label: "Une étiquette volontairement longue pour vérifier l'espacement, la lisibilité et le comportement en wrap",
    },
};

export const Palette: Story = {
    render: (args) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Chip {...args} color="default" label="Default" />
            <Chip {...args} color="info" label="Info" />
            <Chip {...args} color="success" label="Success" />
            <Chip {...args} color="warning" label="Warning" />
            <Chip {...args} color="error" label="Error" />
        </div>
    ),
    args: { label: "Puce" },
};

/** Exact trio from the interface (ComponentShowcase): icons animated in cascade. */
export const ShowcaseRow: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Chip label="Info" color="info" icon={<Icon name="sparkles" size={14} animated />} />
            <Chip label="Validé" color="success" icon={<Icon name="check" size={14} animated />} />
            <Chip
                label="À vérifier"
                color="warning"
                icon={<Icon name="bolt" size={14} animated />}
                onDelete={() => {}}
            />
        </div>
    ),
};

export const FilterBar: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Chip label="Tous les statuts" color="default" />
            <Chip label="Actifs" color="success" icon={<Icon name="check" size={14} animated />} onDelete={() => {}} />
            <Chip label="En attente" color="warning" onDelete={() => {}} />
            <Chip label="Erreurs" color="error" onDelete={() => {}} />
            <Chip label="Archivés" color="info" onDelete={() => {}} />
        </div>
    ),
};
