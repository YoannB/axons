// components/ui/Tabs.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Icon } from "./Icon";
import { Tabs } from "./Tabs";
import type { AppTabItem } from "./types";

const PANELS: AppTabItem[] = [
    { id: "terminal", label: "Terminal" },
    { id: "output", label: "Sortie" },
    { id: "problems", label: "Problèmes" },
];
const PAGES: AppTabItem[] = [
    { id: "home", label: "page.tsx", href: "/", icon: <Icon name="code" size={14} /> },
    { id: "about", label: "contenu.md", href: "/a-propos", icon: <Icon name="box" size={14} />, closable: true },
    { id: "projects", label: "data.json", href: "/projets", icon: <Icon name="box" size={14} />, closable: true },
];

function PanelDemo() {
    const [active, setActive] = useState("terminal");
    return <Tabs ariaLabel="Panneaux" items={PANELS} activeId={active} onSelect={setActive} />;
}

function ClosableDemo() {
    const [items, setItems] = useState(PAGES);
    return (
        <Tabs
            ariaLabel="Fichiers ouverts"
            items={items}
            activeId="about"
            onClose={(id) => setItems((list) => list.filter((t) => t.id !== id))}
            closeLabel={(label) => `Fermer ${label}`}
        />
    );
}

const meta = {
    title: "UI/Tabs",
    component: Tabs,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Bande d'onglets défilante (neutre, sans MUI). Avec `href` : vrais liens dans un `<nav>` avec `aria-current=page` (l'URL fait foi : lien direct, rechargement et précédent/suivant tombent sur le bon onglet). Sans `href` : boutons `aria-pressed` qui appellent `onSelect` (bascule de panneau). Libellés longs tronqués (titre complet au survol), onglet actif ramené dans la vue, bouton de fermeture optionnel avec libellé accessible.",
            },
        },
    },
    args: { items: PANELS, activeId: "terminal", ariaLabel: "Panneaux" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PanelSwitch: Story = { render: () => <PanelDemo /> };
export const LinksWithClose: Story = { render: () => <ClosableDemo /> };
export const Overflow: Story = {
    render: () => (
        <div style={{ maxWidth: 320 }}>
            <Tabs
                ariaLabel="Fichiers ouverts"
                activeId="f6"
                items={Array.from({ length: 8 }, (_, i) => ({
                    id: `f${i}`,
                    label: `un-nom-de-fichier-tres-long-${i}.tsx`,
                }))}
                onSelect={() => {}}
            />
        </div>
    ),
};
