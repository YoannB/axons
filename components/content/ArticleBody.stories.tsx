// components/content/ArticleBody.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleBody } from "./ArticleBody";

const SAMPLE = `A paragraph with **bold**, _italics_, \`code\`, an [internal link](/articles) and an [external link](https://nextjs.org).

# A level-1 heading (demoted to h2)

## A list

- first item;
- [x] done task;
- [ ] task to do.

## A table (GFM)

| Field  | Role                          |
| ------ | ----------------------------- |
| \`slug\` | Last segment of the URL       |
| \`date\` | Publication day (YYYY-MM-DD)  |

## Some code

\`\`\`yaml
title: "Writing an article"
slug: writing-an-article
\`\`\`

> A quote, and ignored raw HTML: <b>not interpreted</b>.

![Cover](/articles/writing-articles/cover.svg)
`;

const meta = {
    title: "Content/ArticleBody",
    component: ArticleBody,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Markdown article body rendered as React elements (`react-markdown` + `remark-gfm`), without `dangerouslySetInnerHTML`: raw HTML in the source is not interpreted. A `# Heading` becomes `<h2>` (the `<h1>` is the page title); external links open in a new tab with `noopener`; wide tables scroll inside their own box (no mobile overflow).",
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
            "| a | b | c | d | e | f |\n| - | - | - | - | - | - |\n| a-long-value | a-long-value | a-long-value | a-long-value | a-long-value | a-long-value |",
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 320 }}>
                <Story />
            </div>
        ),
    ],
};
