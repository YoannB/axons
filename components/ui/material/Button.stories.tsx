// components/ui/material/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
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

// LINK MODE: `href` renders a real <a> styled as the button (never <a><button>). An internal
// pathname goes through next-intl's Link, which reads the locale => provider in isolation.
const withLocale: NonNullable<Story["decorators"]> = [
    (Story) => (
        <NextIntlClientProvider locale="fr" messages={{}}>
            <Story />
        </NextIntlClientProvider>
    ),
];
export const AsLink: Story = {
    args: { variant: "secondary", size: "lg", href: "/sitemap", children: "Plan du site" },
    decorators: withLocale,
    parameters: {
        docs: {
            description: {
                story: "Avec `href`, le bouton est un vrai lien `<a>` (même halo/dégradé) : une seule tabulation, Entrée navigue. Chemin interne => URL localisée (`/fr/plan-du-site`).",
            },
        },
    },
};
export const AsLinkPrimary: Story = {
    args: { variant: "primary", href: "/", children: "Retour à l'accueil" },
    decorators: withLocale,
};
export const ExternalLink: Story = {
    args: { variant: "ghost", href: "https://github.com/YoannB/axons", children: "Code source" },
};
export const DisabledLink: Story = {
    args: { variant: "secondary", href: "/sitemap", disabled: true, children: "Plan du site" },
    decorators: withLocale,
    parameters: {
        docs: {
            description: {
                story: "Un lien désactivé perd son `href` et redevient un `<button disabled>` : ni focusable, ni navigable.",
            },
        },
    },
};
