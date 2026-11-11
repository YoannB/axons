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
                    "Transparency notices shown next to an AI action: third-party provider, variable quality of free models, wait time. Lines arrive already translated (`messages/*.json`, `aiNotice` namespace): the component stays neutral (no next-intl). Empty list = nothing is rendered.",
            },
        },
    },
    argTypes: { items: { control: "object", description: "Already translated lines." } },
    args: {
        items: [
            "Your text is sent to the third-party AI provider (OpenRouter) and to the model it routes to, which may keep it under their own terms. This site itself does not store it.",
            "Free models can be slow or imprecise: if the result looks wrong, simply run it again.",
            "A reply can take up to 30 seconds when the free model is busy.",
        ],
    },
} satisfies Meta<typeof AiNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SingleLine: Story = { args: { items: ["AI-generated reply: check it before publishing it."] } };
export const Empty: Story = { args: { items: [] } };
