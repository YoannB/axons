// components/ui/material/Chip.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
// RELATIVE import (not the '@' alias, which is not declared in Storybook's Vite config).
// Icon is a neutral component; Chip passes it through as is (ReactNode) → the animation
// is carried by Icon + styles/ui/icons.css, with no extra layer and no MUI leak.
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
                    "Neutral chip of the material layer. Public semantic colors per AppChipProps (default | info | success | warning | error — primary/secondary are NOT part of the API). Optional animated icon via the neutral Icon component (passed through as is). Deletion via onDelete, long labels, filter bar.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Text shown in the chip." },
        color: {
            control: "select",
            options: ["default", "info", "success", "warning", "error"],
            description: "Public semantic color (AppChipProps).",
        },
        icon: {
            table: { disable: true },
            description: "Optional icon (ReactNode). Pass <Icon animated /> for the animation.",
        },
        onDelete: {
            table: { disable: true },
            description: "Delete callback. Absent ⇒ chip not deletable.",
        },
    },
    args: { label: "Component", color: "default" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Info: Story = { args: { color: "info", label: "Information" } };
export const Success: Story = { args: { color: "success", label: "Success" } };
export const Warning: Story = {
    args: { color: "warning", label: "Warning" },
};
export const Error: Story = { args: { color: "error", label: "Error" } };

export const WithAnimatedIcon: Story = {
    args: {
        color: "success",
        label: "Verified",
        icon: <Icon name="check" size={14} animated />,
    },
};

export const Deletable: Story = {
    args: { color: "info", label: "Active filter", onDelete: () => {} },
};

export const DeletableWithAnimatedIcon: Story = {
    args: {
        color: "warning",
        label: "To check",
        icon: <Icon name="bolt" size={14} animated />,
        onDelete: () => {},
    },
};

export const LongLabel: Story = {
    args: {
        color: "info",
        label: "A deliberately long label to check spacing, readability and wrapping behavior",
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
    args: { label: "Chip" },
};

/** Exact trio from the interface (ComponentShowcase): icons animated in cascade. */
export const ShowcaseRow: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Chip label="Info" color="info" icon={<Icon name="sparkles" size={14} animated />} />
            <Chip label="Validated" color="success" icon={<Icon name="check" size={14} animated />} />
            <Chip label="To check" color="warning" icon={<Icon name="bolt" size={14} animated />} onDelete={() => {}} />
        </div>
    ),
};

export const FilterBar: Story = {
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <Chip label="All statuses" color="default" />
            <Chip label="Active" color="success" icon={<Icon name="check" size={14} animated />} onDelete={() => {}} />
            <Chip label="Pending" color="warning" onDelete={() => {}} />
            <Chip label="Errors" color="error" onDelete={() => {}} />
            <Chip label="Archived" color="info" onDelete={() => {}} />
        </div>
    ),
};
