// components/ui/material/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../Breadcrumb";
import type { AppBreadcrumbItem } from "../types";

const meta = {
    title: "UI/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    'Fil d’Ariane neutre exposant l’API publique du projet. Le dernier élément est automatiquement traité comme la page courante : il est rendu en texte simple et porte aria-current="page". Les éléments précédents ne deviennent des liens que s’ils possèdent un href.',
            },
        },
    },
    argTypes: {
        items: {
            table: {
                disable: true,
            },
            description:
                "Liste ordonnée des éléments du fil d’Ariane. Chaque élément contient un label et, facultativement, un href.",
        },
    },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems: AppBreadcrumbItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Catalogue", href: "/catalogue" },
    { label: "Composants UI", href: "/catalogue/composants-ui" },
    { label: "Breadcrumb" },
];

export const Default: Story = {
    args: {
        items: defaultItems,
    },
};

export const SingleCurrentPage: Story = {
    args: {
        items: [{ label: "Tableau de bord" }],
    },
};

export const LastItemWithHrefIsCurrent: Story = {
    args: {
        items: [
            { label: "Accueil", href: "/" },
            { label: "Paramètres", href: "/parametres" },
        ],
    },
};

export const IntermediateItemWithoutHref: Story = {
    args: {
        items: [
            { label: "Accueil", href: "/" },
            { label: "Étape intermédiaire" },
            { label: "Confirmation", href: "/confirmation" },
        ],
    },
};

export const LongHierarchy: Story = {
    args: {
        items: [
            { label: "Accueil", href: "/" },
            { label: "Espace client", href: "/espace-client" },
            { label: "Facturation", href: "/espace-client/facturation" },
            { label: "Factures", href: "/espace-client/facturation/factures" },
            {
                label: "Facture 2026-0042",
                href: "/espace-client/facturation/factures/2026-0042",
            },
            { label: "Détail du paiement" },
        ],
    },
};

export const WithoutLinks: Story = {
    args: {
        items: [{ label: "Étape 1" }, { label: "Étape 2" }, { label: "Étape 3" }, { label: "Étape finale" }],
    },
};

export const Empty: Story = {
    args: {
        items: [],
    },
};
