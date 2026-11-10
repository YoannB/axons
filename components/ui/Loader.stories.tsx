// components/ui/Loader.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import type { ComponentProps, ComponentType } from "react";
import { useState } from "react";
import { Loader, SplashLoader } from "./Loader";

/**
 * Loader uses useTranslations("common") => a next-intl provider is required in isolation.
 * Minimal fallback; can be removed if preview.tsx already mounts the app providers
 * with the real messages. The annotation is on the PARAMETER (Dialog.stories.tsx pattern):
 * annotating the VARIABLE (withSplashDom: ComponentType = ...) broke the Story typing
 * (TS2604/2786, "Story: {}").
 */
const fallbackMessages = {
    common: { loading: "Chargement…" },
} as unknown as ComponentProps<typeof NextIntlClientProvider>["messages"];

const withTranslations = (Story: ComponentType) => (
    <NextIntlClientProvider locale="fr" messages={fallbackMessages}>
        <Story />
    </NextIntlClientProvider>
);

/**
 * Rebuilds the server #app-splash container (full-screen fixed, see globals.css)
 * to demonstrate the "full-page splash screen" loader and the dismissal mechanics.
 * The .splash-logo (breathing) belongs to the SERVER markup not provided here: the Logo
 * rendered by <Loader> carries .logo (static), not .splash-logo; the full-screen
 * structure and the fade are faithful.
 */
const withSplashContainer = (Story: ComponentType) => (
    <div id="app-splash">
        <Story />
    </div>
);

/**
 * Dismissal trigger. Plain native HTML button (NOT the material Button facade):
 * a neutral component story must not couple neutral->material, which would break
 * if the MUI layer were replaced. The click mounts SplashLoader (user intent,
 * per react-effects.md); its effect adds .is-leaving => #app-splash fades out.
 */
function DismissDemo() {
    const [dismissed, setDismissed] = useState(false);
    return (
        <>
            <Loader size={96} />
            {!dismissed && (
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    style={{
                        marginTop: 4,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid var(--border-2, #2a3658)",
                        background: "var(--surface-2, #131a30)",
                        color: "var(--text-1, #eaf0ff)",
                        font: "inherit",
                        cursor: "pointer",
                    }}
                >
                    Masquer le splash
                </button>
            )}
            {dismissed && <SplashLoader />}
        </>
    );
}

const meta = {
    title: "UI/Loader",
    component: Loader,
    tags: ["autodocs"],
    decorators: [withTranslations],
    parameters: {
        docs: {
            description: {
                component:
                    'Indicateurs de chargement neutres. `Loader` : bloc déclaratif (role="status", aria-live="polite", aria-label constant) composé du Logo (taille via `size`), d\'une barre animée (`showBar`) et d\'un libellé localisé (`showText`) — utilisé en Suspense / appels IA. `SplashLoader` : retourne null et masque le #app-splash pré-hydratation via la classe .is-leaving (transition opacity/visibility, nœud jamais retiré du DOM).',
            },
        },
    },
    argTypes: {
        size: {
            control: { type: "number", min: 16, max: 160, step: 4 },
            description: "Taille du Logo (icône du site) en px. Défaut 56.",
        },
        showIcon: {
            control: "boolean",
            description: "Afficher le Logo. Défaut true.",
        },
        showBar: {
            control: "boolean",
            description: "Afficher la barre de progression. Défaut true.",
        },
        showText: {
            control: "boolean",
            description: "Afficher le libellé localisé. Défaut true.",
        },
    },
    args: { size: 56, showIcon: true, showBar: true, showText: true },
    render: (args) => <Loader {...args} />,
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon + progress + text (default behavior). */
export const Default: Story = {};

/** Icon only (no bar, no text). */
export const IconOnly: Story = {
    args: { showBar: false, showText: false },
};

/** Progress only (no logo, no text). */
export const ProgressOnly: Story = {
    args: { showIcon: false, showText: false },
};

/** Progress + text, no icon. */
export const BarAndText: Story = {
    args: { showIcon: false },
};

/** Different site icon sizes (size passed to the Logo). */
export const Sizes: Story = {
    render: (args) => (
        <div
            style={{
                display: "flex",
                gap: "2rem",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            {[24, 40, 56, 80].map((s) => (
                <div key={s} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                    <Loader {...args} size={s} showText={false} />
                    <small style={{ color: "var(--muted, #7c8aa8)", fontSize: "0.7rem" }}>{s}px</small>
                </div>
            ))}
        </div>
    ),
};

/** Full-screen splash screen: #app-splash (fixed, z:9999) + centered loader.
 *  Deliberately covers the canvas: that is the real effect of a startup screen. */
export const FullPageSplash: Story = {
    decorators: [withSplashContainer],
    render: () => <Loader size={96} />,
    parameters: {
        docs: {
            description: {
                story: "Structure du splash plein écran (conteneur #app-splash reconstitué + Loader grande taille). Le .splash-logo respirant du markup serveur n'est pas reproduit (Logo.tsx non fourni) : on vérifie ici le conteneur fixed centré et la barre animée.",
            },
        },
    },
};

/** Dismissal mechanics: splash visible, then fades out on click (SplashLoader -> .is-leaving). */
export const SplashDismissal: Story = {
    decorators: [withSplashContainer],
    render: () => <DismissDemo />,
    parameters: {
        docs: {
            description: {
                story: "Avant clic : #app-splash visible (Loader + déclencheur). Au clic, SplashLoader se monte et son effet ajoute .is-leaving => fondu opacity/visibility/pointer-events, sans retrait du nœud du DOM (mutation additive, conforme react-effects.md). Le conteneur étant fixed z:9999, il couvre le canvas pendant la démo.",
            },
        },
    },
};
