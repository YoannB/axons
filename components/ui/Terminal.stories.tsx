// components/ui/Terminal.stories.tsx
import { useScriptedSequence } from "@/hooks/use-scripted-sequence";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { Terminal } from "./Terminal";
import type { AppTerminalLine } from "./types";

const LINES: AppTerminalLine[] = [
    { id: "1", kind: "command", text: "npm run generate-site" },
    { id: "2", text: "Initialisation du projet…" },
    { id: "3", kind: "success", text: "Création des composants" },
    { id: "4", kind: "success", text: "Optimisation SEO (meta, sitemap, robots.txt)" },
    { id: "5", kind: "success", text: "Site en ligne !" },
    { id: "6", kind: "link", text: "https://axons-preview.netlify.app", href: "https://axons-preview.netlify.app" },
];

function Scripted() {
    const seq = useScriptedSequence(LINES.length, 400);
    return (
        <Terminal
            ariaLabel="Démo"
            title="Terminal"
            lines={LINES.slice(0, seq.shown)}
            running={seq.status === "running"}
            actions={
                <>
                    <Button size="sm" variant="primary" onClick={seq.start} disabled={seq.status === "running"}>
                        Lancer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={seq.reset}>
                        Réinitialiser
                    </Button>
                </>
            }
        />
    );
}

const meta = {
    title: "UI/Terminal",
    component: Terminal,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Console en lecture seule (neutre, sans MUI) : lignes typées `command | output | success | error | link`, texte React (jamais d'innerHTML), région `role=log` + `aria-live=polite` (les nouvelles lignes sont annoncées), hauteur maximale via `rows`, curseur clignotant quand `running`. Associée à `useScriptedSequence` pour une démo scénarisée ; avec `prefers-reduced-motion`, la séquence s'affiche d'un coup.",
            },
        },
    },
    args: { lines: LINES, ariaLabel: "Démo", title: "Terminal" },
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {};
export const Running: Story = { args: { lines: LINES.slice(0, 3), running: true } };
export const WithError: Story = {
    args: {
        lines: [
            { id: "1", kind: "command", text: "npm run build" },
            { id: "2", kind: "error", text: "Échec : variable NEXT_PUBLIC_LOCALES invalide" },
        ],
    },
};
export const ScriptedSequence: Story = { render: () => <Scripted /> };
