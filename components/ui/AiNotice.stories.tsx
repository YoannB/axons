// components/ui/AiNotice.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { AiNotice } from "./AiNotice";

const meta = {
    title: "UI/AiNotice",
    component: AiNotice,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Mentions de transparence affichées près d'une action IA : fournisseur tiers, qualité variable des modèles gratuits, temps d'attente. Les lignes arrivent déjà traduites (`messages/*.json`, espace `aiNotice`) : le composant reste neutre (pas de next-intl). Liste vide = rien n'est rendu.",
            },
        },
    },
    argTypes: { items: { control: "object", description: "Lignes déjà traduites." } },
    args: {
        items: [
            "Votre texte est envoyé au fournisseur d'IA tiers (OpenRouter) et au modèle qu'il sollicite, qui peuvent le conserver selon leurs propres conditions. Ce site, lui, ne le conserve pas.",
            "Les modèles gratuits peuvent être lents ou imprécis : si le résultat vous semble faux, relancez simplement.",
            "Une réponse peut prendre jusqu'à 30 secondes quand le modèle gratuit est saturé.",
        ],
    },
} satisfies Meta<typeof AiNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleLine: Story = { args: { items: ["Réponse générée par une IA : vérifiez-la avant de la publier."] } };
export const Empty: Story = { args: { items: [] } };
