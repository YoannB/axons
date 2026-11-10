// components/ui/material/Toast.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Button } from "../Button";
import { Toast } from "../Toast";

const noop = () => {};

/**
 * Demo wrapper.
 *
 * OPENING PARITY: `visible` is `false` by default, so the Docs page
 * only shows one `Button` per variant instead of `Snackbar`s stacked
 * in the portal. The toast shows on click, one at a time; auto-hide
 * (or the close button) closes it and brings the button back.
 * The open button uses the `Button` facade (not a raw `<button>`)
 * to match the web interface rendering (halo / gradient).
 *
 * PROGRESS BAR (`showProgress`): the `toastProgress` CSS animation is
 * NOT infinite (`forwards`); `key={generation}` therefore remounts the `Toast` node
 * on every re-display, which REPLAYS the bar from scaleX(1). Without this
 * remount, a toast re-displayed on the same node would keep the bar already at
 * scaleX(0) (invisible). That is why `generation` exists, not a detail.
 */
function StatefulToast({ onDismiss = noop, ...props }: ComponentProps<typeof Toast>) {
    const [visible, setVisible] = useState(false);
    const [generation, setGeneration] = useState(0);
    return (
        <>
            {!visible && (
                <Button
                    variant="secondary"
                    onClick={() => {
                        setGeneration((current) => current + 1);
                        setVisible(true);
                    }}
                >
                    Afficher le toast
                </Button>
            )}
            {visible && (
                <Toast
                    key={generation}
                    {...props}
                    onDismiss={(id) => {
                        setVisible(false);
                        onDismiss(id);
                    }}
                />
            )}
        </>
    );
}

const meta = {
    title: "UI/Toast",
    component: Toast,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Notification temporaire neutre du projet. Chaque story s'affiche au clic (bouton `Button`) pour éviter l'empilement des portails sur la page Docs ; les sévérités se vérifient donc story par story, la façade ancrant le toast dans un portail unique et éphémère (une grille multi‑toasts n'est pas pertinente). Couvre les sévérités publiques, les durées courtes et longues, les messages volumineux, la fermeture manuelle et la barre de décompte opt‑in (`showProgress`, synchronisée sur `duration`). Ancrage en bas‑gauche pour ne pas chevaucher la vidéo sticky en bas‑droite ; l'offset anti‑badge Netlify est posé en CSS material.",
            },
        },
    },
    argTypes: {
        id: {
            control: "text",
            description: "Identifiant du toast, transmis au callback onDismiss lors de la fermeture.",
        },
        severity: {
            control: "select",
            options: ["info", "success", "warning", "error"],
            description: "Sévérité visuelle et sémantique du message.",
        },
        message: {
            control: "text",
            description: "Contenu textuel affiché dans le toast.",
        },
        duration: {
            control: { type: "number", min: 1000, step: 500 },
            description:
                "Durée d'affichage automatique en millisecondes. Par défaut, la façade utilise 4000 ms. Sert aussi de durée à la barre de décompte quand showProgress est actif.",
        },
        showProgress: {
            control: "boolean",
            description:
                "Affiche une barre de décompte linéaire sur la durée d'affichage (alignée sur autoHideDuration). Opt‑in : défaut false, rendu historique inchangé. Le remontage par `key` rejoue la barre à chaque ouverture.",
        },
        onDismiss: {
            table: { disable: true },
            description:
                "Callback appelé lorsque le toast est fermé manuellement ou automatiquement. Désactivé dans les contrôles Storybook car les stories utilisent un état local de démonstration.",
        },
    },
    args: {
        id: "toast-example",
        severity: "info",
        message: "Modification enregistrée.",
        duration: 4000,
        showProgress: false,
        onDismiss: noop,
    },
    render: (args) => <StatefulToast {...args} />,
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: { severity: "info", message: "Une information est disponible." },
};

export const Success: Story = {
    args: {
        severity: "success",
        message: "L'action a été effectuée avec succès.",
    },
};

export const Warning: Story = {
    args: {
        severity: "warning",
        message: "Certains champs méritent votre attention.",
    },
};

export const Error: Story = {
    args: {
        severity: "error",
        message: "Le service est momentanément indisponible.",
    },
};

export const ShortDuration: Story = {
    args: {
        severity: "info",
        message: "Ce toast disparaît rapidement.",
        duration: 1500,
    },
};

export const LongDuration: Story = {
    args: {
        severity: "success",
        message: "Ce toast reste visible plus longtemps.",
        duration: 10000,
    },
};

export const LongMessage: Story = {
    args: {
        severity: "warning",
        message:
            "Ceci est un message volontairement long afin de vérifier la lisibilité, l'ancrage en bas-gauche et le comportement du toast lorsque le texte dépasse une ligne.",
        duration: 8000,
    },
};

export const ManualDismissal: Story = {
    args: {
        severity: "error",
        message:
            "Fermeture manuelle possible via la croix du toast. La durée est allongée pour faciliter la vérification.",
        duration: 60000,
    },
};

/**
 * Visible countdown bar. Longer duration so that the linear scaleX(1)->scaleX(0)
 * is readable by eye; the bar and the auto-hide start at the
 * same instant (mount) and last `duration`, so they end
 * together. The `showProgress` control stays active on ALL the other
 * stories (Controls tab): you can toggle it on the fly on Info,
 * Warning, etc., without a dedicated story.
 */
export const WithProgress: Story = {
    args: {
        severity: "info",
        message: "Barre de décompte visible sur toute la durée d'affichage.",
        duration: 8000,
        showProgress: true,
    },
};
