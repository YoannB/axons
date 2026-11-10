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
                    "Illustration décorative d'état vide (page 404, liste sans contenu) : un astronaute flotte avec sa loupe entre les étoiles et une planète. SVG neutre (sans MUI), `aria-hidden` (le texte de la page porte le sens), couleurs issues des tokens du thème, animations CSS coupées sous `prefers-reduced-motion`.",
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
