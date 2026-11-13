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
                    "Preview of an internal article (the `/articles` list and the home page's \"latest articles\" block). Server Component compatible: no hook, labels arrive already formatted. The title is a real link to the localized URL of the displayed translation; the thumbnail is a decorative duplicate (`aria-hidden`, out of the tab order). On a language fallback, a badge shows the original's language and the title/summary carry `lang`.",
            },
        },
    },
    args: {
        title: "Writing an article in Axons",
        description: "One folder per article, one Markdown file per language: from the front matter to the sitemap.",
        slug: "writing-an-article",
        locale: "en",
        date: "2026-11-10",
        dateLabel: "Published on November 10, 2026",
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

export const WithCover: Story = { args: { image: "/storybook-assets/story-cover.svg" } };
export const WithoutCover: Story = {};
export const LanguageFallback: Story = {
    args: {
        title: "Écrire un article dans Axons",
        description: "Un dossier par article, un fichier Markdown par langue : de l'entête YAML au sitemap.",
        slug: "ecrire-un-article",
        locale: "fr",
        dateLabel: "Published on November 3, 2026",
        fallback: { flag: "🇫🇷", label: "Français", title: "Only available in Français" },
    },
};
export const InHomeBlock: Story = { args: { headingLevel: "h3", image: "/storybook-assets/story-cover.svg" } };
