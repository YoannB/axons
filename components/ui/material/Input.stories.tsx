// components/ui/material/Input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Input } from "../Input";
import type { AppInputProps } from "../types";

const noop = () => {};

/**
 * Interface parity: FIXED external label (the .fld > label pattern of
 * ComponentShowcase), inner label neutralized (`label=" "`). The decorative
 * ring and the MUI asterisk are handled in the material CSS (index.css):
 * the MUI outline is hidden on focus (no more double border) and the MUI
 * asterisk is hidden in .mui-field. `required` is still passed to the facade
 * (native attribute + aria-required on the input); the VISUAL asterisk is carried
 * by the external label, in red, aria-hidden (the semantics are already on
 * the input). `onChange` is optional on the wrapper, always provided to the facade.
 */
type LabeledInputProps = Omit<AppInputProps, "label" | "onChange"> & {
    label?: string;
    onChange?: (v: string) => void;
};

function LabeledInput({
    label: externalLabel,
    value: initialValue = "",
    onChange,
    required,
    ...rest
}: LabeledInputProps) {
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
            {/* required passed to the facade (a11y); its MUI asterisk is hidden by index.css */}
            <Input {...rest} required={required} label=" " value={value} onChange={handleChange} />
        </div>
    );
}

const meta = {
    title: "UI/Input",
    component: Input,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Champ de saisie neutre. Parité interface : libellé FIXE externe (l'astérisque de `required` y est porté), libellé interne neutralisé. L'anneau rotatif est l'unique contour au focus (l'outline MUI est masquée en CSS material, plus de double bordure). Couvre placeholder, requis, désactivé, texte d'aide, erreur, priorité error/helperText et types HTML natifs.",
            },
        },
    },
    argTypes: {
        label: { control: "text", description: "Texte du libellé FIXE externe." },
        value: { control: "text", description: "Valeur initiale." },
        placeholder: { control: "text", description: "Placeholder lorsque vide." },
        disabled: { control: "boolean", description: "Désactive le champ." },
        required: {
            control: "boolean",
            description: "Marque obligatoire (astérisque sur le libellé externe + attribut natif).",
        },
        error: {
            control: "text",
            description: "Message d'erreur (prime sur helperText).",
        },
        helperText: { control: "text", description: "Texte d'aide sans erreur." },
        type: {
            control: "select",
            options: ["text", "email", "password", "number", "search", "tel", "url"],
            description: "Type HTML natif.",
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
    args: { label: "Label", value: "", onChange: noop },
    render: (args) => <LabeledInput key={String(args.value)} {...args} />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Nom complet",
        placeholder: "Jean Dupont",
        helperText: "Saisissez votre prénom et votre nom.",
    },
};
export const Required: Story = {
    args: {
        label: "Adresse email",
        type: "email",
        required: true,
        helperText: "Ce champ est obligatoire.",
    },
};
export const Disabled: Story = {
    args: {
        label: "Identifiant",
        value: "USER-123",
        disabled: true,
        helperText: "Modifiable uniquement par un administrateur.",
    },
};
export const HelperText: Story = {
    args: {
        label: "Titre du projet",
        placeholder: "Mon projet",
        helperText: "50 caractères maximum.",
    },
};
export const Error: Story = {
    args: {
        label: "Adresse email",
        type: "email",
        value: "jean.example",
        error: "Format d'email invalide.",
    },
};
export const ErrorOverridesHelperText: Story = {
    args: {
        label: "Mot de passe",
        type: "password",
        error: "Le mot de passe est requis.",
        helperText: "Cette aide ne doit pas s'afficher lorsqu'une erreur est présente.",
    },
};
export const Password: Story = {
    args: {
        label: "Mot de passe",
        type: "password",
        placeholder: "••••••••",
        helperText: "8 caractères minimum.",
    },
};
export const Search: Story = {
    args: {
        label: "Recherche",
        type: "search",
        placeholder: "Rechercher un article…",
    },
};
export const FormAttributes: Story = {
    args: {
        id: "company-website",
        name: "website",
        label: "Site web",
        type: "url",
        placeholder: "https://exemple.fr",
        helperText: "Inclure le protocole https://.",
    },
};
export const Types: Story = {
    render: () => (
        <div style={{ display: "grid", gap: "1rem", maxWidth: "420px" }}>
            <LabeledInput id="input-text" label="Text" type="text" value="Texte libre" />
            <LabeledInput id="input-email" label="Email" type="email" value="user@example.com" />
            <LabeledInput id="input-password" label="Mot de passe" type="password" value="secret" />
            <LabeledInput id="input-number" label="Nombre" type="number" value="42" />
            <LabeledInput id="input-search" label="Recherche" type="search" placeholder="Rechercher…" value="" />
            <LabeledInput id="input-tel" label="Téléphone" type="tel" value="+33123456789" />
            <LabeledInput id="input-url" label="URL" type="url" value="https://example.com" />
        </div>
    ),
};
