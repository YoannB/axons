// components/content/ArticleBody.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleBody } from "./ArticleBody";

const SAMPLE = `Un paragraphe avec du **gras**, de l'_italique_, du \`code\`, un [lien interne](/articles) et un [lien externe](https://nextjs.org).

# Un titre de niveau 1 (rétrogradé en h2)

## Une liste

- premier point ;
- [x] tâche faite ;
- [ ] tâche à faire.

## Un tableau (GFM)

| Champ  | Rôle                          |
| ------ | ----------------------------- |
| \`slug\` | Dernier segment de l'URL      |
| \`date\` | Jour de publication (AAAA-MM-JJ) |

## Du code

\`\`\`yaml
title: "Écrire un article"
slug: ecrire-un-article
\`\`\`

> Une citation, et du HTML brut ignoré : <b>non interprété</b>.

![Couverture](/articles/writing-articles/cover.svg)
`;

const meta = {
    title: "Content/ArticleBody",
    component: ArticleBody,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Corps d'article Markdown rendu en éléments React (`react-markdown` + `remark-gfm`), sans `dangerouslySetInnerHTML` : le HTML brut du source n'est pas interprété. Un `# Titre` devient `<h2>` (le `<h1>` est le titre de la page) ; les liens externes s'ouvrent dans un nouvel onglet avec `noopener` ; les tableaux larges défilent dans leur propre boîte (pas de débordement mobile).",
            },
        },
    },
    args: { markdown: SAMPLE },
    decorators: [
        (Story) => (
            <div className="card" style={{ margin: 24, padding: 24, maxWidth: 760 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ArticleBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllElements: Story = {};
export const NarrowTable: Story = {
    args: {
        markdown:
            "| a | b | c | d | e | f |\n| - | - | - | - | - | - |\n| une-valeur-longue | une-valeur-longue | une-valeur-longue | une-valeur-longue | une-valeur-longue | une-valeur-longue |",
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 320 }}>
                <Story />
            </div>
        ),
    ],
};
