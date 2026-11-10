// components/ui/DiffView.stories.tsx
import { diffWords } from "@/lib/text/diff";
import type { Meta, StoryObj } from "@storybook/react";
import { DiffLegend, DiffView } from "./DiffView";

const LABELS = { insert: "Ajout", replace: "Correction", delete: "Suppression" };
const BEFORE = "Merci pour vos retour, je vous envoi le document corigé demain matin";
const AFTER = "Merci pour vos retours, je vous envoie le document corrigé demain matin.";

const meta = {
    title: "UI/DiffView",
    component: DiffView,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Rendu en lecture seule d'un diff mot à mot (`lib/text/diff`). Chaque op devient un nœud texte React dans `<ins>` / `<del>` / `<mark>` : jamais d'innerHTML, une réponse de modèle ne peut donc pas injecter de balises. Hauteur fixe dérivée de `rows` (même boîte que le Textarea), défilement au-delà. Région focusable (`role=region` + `aria-label`). Le titre d'un remplacement affiche l'ancien texte.",
            },
        },
    },
    argTypes: {
        ops: { control: false, description: "Ops issues de `diffWords(before, after)`." },
        ariaLabel: { control: "text", description: "Nom accessible de la région." },
        placeholder: { control: "text", description: "Affiché quand `ops` est vide." },
        hideDeletions: { control: "boolean", description: "Masque le texte supprimé (texte « après » seul)." },
        rows: { control: { type: "number", min: 2, max: 12 }, description: "Lignes visibles (hauteur fixe)." },
    },
    args: {
        ops: diffWords(BEFORE, AFTER),
        ariaLabel: "Texte corrigé",
        labels: LABELS,
        rows: 4,
    },
    render: (args) => (
        <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
            <DiffLegend labels={LABELS} />
            <DiffView {...args} />
        </div>
    ),
} satisfies Meta<typeof DiffView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HideDeletions: Story = { args: { hideDeletions: true } };
export const Empty: Story = {
    args: { ops: [], placeholder: "Lancez l'outil pour voir le résultat ici." },
};
export const Identical: Story = { args: { ops: diffWords(AFTER, AFTER) } };
export const Overflow: Story = {
    args: {
        rows: 2,
        ops: diffWords(`${BEFORE}\n${BEFORE}\n${BEFORE}`, `${AFTER}\n${AFTER}\n${AFTER}`),
    },
};
export const InjectedMarkupStaysText: Story = {
    args: { ops: diffWords("Bonjour", 'Bonjour <img src=x onerror="alert(1)">') },
    parameters: {
        docs: {
            description: { story: "Le balisage renvoyé par un modèle s'affiche comme du texte, jamais comme du HTML." },
        },
    },
};
