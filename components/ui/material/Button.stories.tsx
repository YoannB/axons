// components/ui/material/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button"; // neutral facade → tests the public API, not MUI
const meta = {
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        variant: { control: "select", options: ["primary", "secondary", "ghost"] },
        size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {
    args: { variant: "primary", children: "Bouton principal" },
};
export const Loading: Story = {
    args: { variant: "primary", loading: true, children: "Envoi…" },
};
export const Disabled: Story = {
    args: { variant: "secondary", disabled: true, children: "Secondaire" },
};
