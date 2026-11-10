// components/ui/material/Textarea.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Textarea } from "../Textarea";
import type { AppTextareaProps } from "../types";

const noop = () => {};

/** Same parity pattern as Input: FIXED external label (it carries the
 *  asterisk), inner label neutralized; single focus ring and MUI asterisk
 *  hidden via material/index.css. */
type LabeledTextareaProps = Omit<AppTextareaProps, "label" | "onChange"> & {
    label?: string;
    onChange?: (v: string) => void;
};

function LabeledTextarea({
    label: externalLabel,
    value: initialValue = "",
    onChange,
    required,
    ...rest
}: LabeledTextareaProps) {
    const [value, setValue] = useState(initialValue);
    const handleChange = (v: string) => {
        setValue(v);
        onChange?.(v);
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            {externalLabel ? (
                <label
                    style={{
                        fontSize: "0.78rem",
                        color: "var(--muted, #7c8aa8)",
                        lineHeight: 1.2,
                    }}
                >
                    {externalLabel}
                    {required ? (
                        <span aria-hidden="true" style={{ color: "var(--danger, #ff5470)", marginLeft: 2 }}>
                            *
                        </span>
                    ) : null}
                </label>
            ) : null}
            <Textarea {...rest} required={required} label=" " value={value} onChange={handleChange} />
        </div>
    );
}

const meta = {
    title: "UI/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Zone de texte neutre. Parité interface : libellé FIXE externe (astérisque de `required` porté dessus), libellé interne neutralisé ; anneau rotatif unique au focus. Couvre placeholder, requis, désactivé, texte d'aide, erreur, priorité error/helperText et hauteurs via rows.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Texte du libellé FIXE externe." },
        value: { control: "text", description: "Valeur initiale." },
        placeholder: { control: "text", description: "Placeholder lorsque vide." },
        disabled: { control: "boolean", description: "Désactive la zone." },
        required: {
            control: "boolean",
            description: "Marque obligatoire (astérisque externe + attribut natif).",
        },
        error: {
            control: "text",
            description: "Message d'erreur (prime sur helperText).",
        },
        helperText: { control: "text", description: "Texte d'aide sans erreur." },
        rows: {
            control: { type: "number", min: 2, max: 12 },
            description: "Lignes visibles.",
        },
        id: {
            control: "text",
            description: "Identifiant DOM (association/tests).",
        },
        name: { control: "text", description: "Nom de champ (formulaires)." },
        onChange: {
            table: { disable: true },
            description: "Désactivé : état local de démonstration.",
        },
    },
    args: { label: "Commentaire", value: "", rows: 4, onChange: noop },
    render: (args) => <LabeledTextarea key={String(args.value)} {...args} />,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Commentaire",
        placeholder: "Saisissez votre retour…",
        helperText: "Vous pouvez utiliser plusieurs lignes.",
    },
};
export const Required: Story = {
    args: {
        label: "Message",
        required: true,
        placeholder: "Votre message est obligatoire.",
        helperText: "Ce champ doit être rempli.",
    },
};
export const Disabled: Story = {
    args: {
        label: "Note interne",
        value: "Cette zone est en lecture seule.",
        disabled: true,
        helperText: "Modifiable uniquement par un administrateur.",
    },
};
export const HelperText: Story = {
    args: {
        label: "Description du projet",
        placeholder: "Décrivez brièvement votre projet.",
        helperText: "500 caractères maximum.",
    },
};
export const Error: Story = {
    args: { label: "Message", value: "", error: "Le message est requis." },
};
export const ErrorOverridesHelperText: Story = {
    args: {
        label: "Commentaire",
        value: "Brouillon incomplet",
        error: "Le commentaire doit contenir au moins 10 caractères.",
        helperText: "Cette aide ne doit pas s'afficher lorsqu'une erreur est présente.",
    },
};
export const Compact: Story = {
    args: {
        label: "Résumé",
        rows: 2,
        placeholder: "Deux lignes suffisent parfois.",
    },
};
export const Expanded: Story = {
    args: {
        label: "Notes longues",
        rows: 8,
        placeholder: "Vous disposez d'un espace plus important.",
        helperText: "Hauteur augmentée via rows.",
    },
};
export const LongContent: Story = {
    args: {
        label: "Historique",
        rows: 6,
        value: "Première ligne de contexte.\n\nDeuxième paragraphe avec un saut de ligne.\n\nTroisième élément pour vérifier le rendu multi-lignes, le défilement éventuel et la lisibilité du texte.",
    },
};
export const FormAttributes: Story = {
    args: {
        id: "feedback-message",
        name: "message",
        label: "Votre retour",
        placeholder: "Partagez votre expérience…",
        helperText: "Ces attributs facilitent l'intégration dans un formulaire.",
    },
};
export const RowsComparison: Story = {
    render: (args) => (
        <div style={{ display: "grid", gap: "1rem", maxWidth: "520px" }}>
            <LabeledTextarea {...args} id="textarea-rows-2" label="rows = 2" rows={2} />
            <LabeledTextarea {...args} id="textarea-rows-4" label="rows = 4" rows={4} />
            <LabeledTextarea {...args} id="textarea-rows-8" label="rows = 8" rows={8} />
        </div>
    ),
    args: { placeholder: "Zone de texte de démonstration." },
};
