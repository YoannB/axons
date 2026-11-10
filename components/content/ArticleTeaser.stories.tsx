// components/content/ArticleTeaser.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleTeaser } from "./ArticleTeaser";

const meta = {
    title: "Content/ArticleTeaser",
    component: ArticleTeaser,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Aperçu d'un article interne (liste `/articles` et bloc « derniers articles » de l'accueil). Compatible Server Component : aucun hook, les libellés arrivent déjà formatés. Le titre est un vrai lien vers l'URL localisée de la traduction affichée ; la vignette est un doublon décoratif (`aria-hidden`, hors tabulation). En repli de langue, un badge indique la langue de l'original et le titre/résumé portent `lang`.",
            },
        },
    },
    args: {
        title: "Écrire un article dans Axons",
        description: "Un dossier par article, un fichier Markdown par langue : de l'entête YAML au sitemap.",
        slug: "ecrire-un-article",
        locale: "fr",
        date: "2026-11-10",
        dateLabel: "Publié le 10 novembre 2026",
    },
    decorators: [
        (Story) => (
            <div style={{ padding: 24, maxWidth: 860 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ArticleTeaser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCover: Story = { args: { image: "/articles/writing-articles/cover.svg" } };
export const WithoutCover: Story = {};
export const LanguageFallback: Story = {
    args: {
        title: "A five-minute tour of the Axons architecture",
        description: "The few boundaries that hold Axons together.",
        slug: "architecture-tour",
        locale: "en",
        dateLabel: "Publié le 3 novembre 2026",
        fallback: { flag: "🇬🇧", label: "English", title: "Disponible uniquement en English" },
    },
};
export const InHomeBlock: Story = { args: { headingLevel: "h3", image: "/articles/writing-articles/cover.svg" } };
