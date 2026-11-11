// components/ui/EmptyUniverse.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { EmptyUniverse } from "./EmptyUniverse";

const meta = {
    title: "UI/EmptyUniverse",
    component: EmptyUniverse,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Decorative empty-state illustration (404 page, list without content): an astronaut floats with a magnifying glass between the stars and a planet. Neutral SVG (no MUI), `aria-hidden` (the page text carries the meaning), colors from the theme tokens, CSS animations turned off under `prefers-reduced-motion`.",
            },
        },
    },
    decorators: [
        (Story) => (
            <div style={{ padding: 24 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof EmptyUniverse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
