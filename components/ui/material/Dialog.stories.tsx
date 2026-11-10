// components/ui/material/Dialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps, ComponentType } from "react";
import { useState } from "react";
import { Button } from "../Button";
import { Dialog } from "../Dialog";

const noop = () => {};

/**
 * Minimal i18n fallback for Storybook. If `.storybook/preview.tsx` already mounts
 * the app providers with the real `next-intl` messages, this decorator
 * can be removed. It guarantees that `Dialog`, which uses
 * `useTranslations("showcase")`, stays self-contained in the verification environment.
 */
const fallbackMessages = {
    showcase: { dialogClose: "Fermer la fenêtre" },
} as unknown as ComponentProps<typeof NextIntlClientProvider>["messages"];

const withTranslations = (Story: ComponentType) => (
    <NextIntlClientProvider locale="fr" messages={fallbackMessages}>
        <Story />
    </NextIntlClientProvider>
);

/**
 * Demo wrapper.
 *
 * OPENING PARITY: `open` is `false` by default, so the Docs page
 * only shows one button per variant (the `Button` facade, to match
 * the interface) instead of stacked portals. Each story's dialog
 * opens on click, with ITS own content, one at a time.
 */
function StatefulDialog({ open: initiallyOpen = false, onClose = noop, ...props }: ComponentProps<typeof Dialog>) {
    const [open, setOpen] = useState(initiallyOpen);
    const handleClose = () => {
        setOpen(false);
        onClose();
    };
    return (
        <>
            {!open && (
                <Button variant="secondary" onClick={() => setOpen(true)}>
                    Ouvrir la boîte de dialogue
                </Button>
            )}
            <Dialog {...props} open={open} onClose={handleClose} />
        </>
    );
}

const meta = {
    title: "UI/Dialog",
    component: Dialog,
    tags: ["autodocs"],
    decorators: [withTranslations],
    parameters: {
        docs: {
            description: {
                component:
                    "Boîte de dialogue neutre du projet. Chaque story s'ouvre au clic (bouton `Button`) afin d'éviter la superposition des portails sur la page Docs ; le contenu de chaque variante reste vérifiable isolément. Couvre l'état ouvert/fermé, la présence ou l'absence de titre et de footer, le contenu long et les actions de confirmation. La croix de fermeture est animée via le CSS material (`.dialog-close`) et porte un aria-label fourni par next-intl.",
            },
        },
    },
    argTypes: {
        open: {
            control: "boolean",
            description: "État d'ouverture initial. À `false` par défaut pour préserver la page Docs.",
        },
        title: {
            control: "text",
            description: "Titre optionnel de la boîte de dialogue.",
        },
        children: {
            table: { disable: true },
            description: "Contenu principal de la boîte de dialogue.",
        },
        footer: {
            table: { disable: true },
            description: "Zone d'actions optionnelle, généralement composée de boutons neutres.",
        },
        onClose: {
            table: { disable: true },
            description: "Callback appelé lors de la fermeture par la croix, le backdrop ou l'échap.",
        },
    },
    args: {
        open: false,
        onClose: noop,
        title: "Confirmer l'action",
        children: "Voulez-vous vraiment appliquer cette modification ?",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Annuler
                </Button>
                <Button onClick={noop}>Confirmer</Button>
            </>
        ),
    },
    render: (args) => <StatefulDialog key={String(args.open)} {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTitle: Story = {
    args: {
        title: undefined,
        children:
            "Cette boîte de dialogue n'a pas de titre. Le contenu reste accessible, mais un titre explicite est recommandé pour les cas réels.",
    },
};

export const WithoutFooter: Story = {
    args: {
        footer: undefined,
        children:
            "Aucune action de footer n'est fournie. La fermeture se fait via la croix, le backdrop ou la touche Échap.",
    },
};

export const LongContent: Story = {
    args: {
        title: "Conditions d'utilisation",
        children: (
            <div style={{ display: "grid", gap: "1rem" }}>
                {Array.from({ length: 12 }, (_, index) => (
                    <p key={index}>
                        Ceci est un paragraphe de démonstration destiné à vérifier le comportement de défilement du
                        contenu dans une boîte de dialogue. Le bloc de contenu doit rester lisible sans casser la mise
                        en page, même lorsque le texte est volumineux.
                    </p>
                ))}
            </div>
        ),
    },
};

export const DestructiveAction: Story = {
    args: {
        title: "Supprimer l'élément",
        children: "Cette action est irréversible. L'élément sélectionné sera définitivement supprimé.",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={noop}>
                    Supprimer
                </Button>
            </>
        ),
    },
};

export const CustomFooter: Story = {
    args: {
        title: "Sélection multiple",
        children:
            "Le footer peut contenir plusieurs actions neutres, y compris des boutons secondaires, fantômes ou principaux.",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Réinitialiser
                </Button>
                <Button variant="secondary" onClick={noop}>
                    Annuler
                </Button>
                <Button onClick={noop}>Appliquer</Button>
            </>
        ),
    },
};
