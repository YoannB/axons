// components/ui/EditorPair.stories.tsx
import { diffWords } from "@/lib/text/diff";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AiNotice } from "./AiNotice";
import { Button } from "./Button";
import { DiffView } from "./DiffView";
import { EditorPair } from "./EditorPair";
import { Textarea } from "./Textarea";

const REFERENCE = "Bonjour Marie, je reviens vers vous concernant le devis : est-il toujours valable ?";

function Demo({ withAction }: { withAction: boolean }) {
    const [text, setText] = useState("Bonjour Marie je reviens vers vous concernant le devis est-il toujours valable");
    return (
        <EditorPair
            endId="story-result"
            startToolbar={<strong>Source</strong>}
            endToolbar={<strong>Résultat</strong>}
            start={<Textarea label="Votre texte" value={text} onChange={setText} rows={5} maxLength={300} showCount />}
            end={<DiffView ops={diffWords(text, REFERENCE)} ariaLabel="Résultat" rows={5} />}
            action={
                withAction ? (
                    <div style={{ display: "grid", gap: 8 }}>
                        <Button variant="primary" fullWidth>
                            Lancer
                        </Button>
                        <AiNotice items={["Le texte est envoyé à un fournisseur d'IA tiers."]} />
                    </div>
                ) : undefined
            }
        />
    );
}

const meta = {
    title: "UI/EditorPair",
    component: EditorPair,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Mise en page source | résultat pour les outils texte : deux colonnes égales sur une seule ligne de grille (même largeur quel que soit le contenu ; donner le même `rows` au Textarea et au DiffView pour la même hauteur). Sous 900 px : empilement source, action, résultat. `endId` sert de cible de défilement après un appel. Redimensionner le canvas pour voir l'empilement.",
            },
        },
    },
    args: { start: null, end: null },
} satisfies Meta<typeof EditorPair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = { render: () => <Demo withAction /> };
export const WithoutAction: Story = { render: () => <Demo withAction={false} /> };
