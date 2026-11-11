// components/ui/Tabs.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Icon } from "./Icon";
import { Tabs } from "./Tabs";
import type { AppTabItem } from "./types";

const PANELS: AppTabItem[] = [
    { id: "terminal", label: "Terminal" },
    { id: "output", label: "Output" },
    { id: "problems", label: "Problems" },
];
const PAGES: AppTabItem[] = [
    { id: "home", label: "page.tsx", href: "/", icon: <Icon name="code" size={14} /> },
    { id: "about", label: "content.md", href: "/about", icon: <Icon name="box" size={14} />, closable: true },
    { id: "projects", label: "data.json", href: "/projects", icon: <Icon name="box" size={14} />, closable: true },
];

function PanelDemo() {
    const [active, setActive] = useState("terminal");
    return <Tabs ariaLabel="Panels" items={PANELS} activeId={active} onSelect={setActive} />;
}

function ClosableDemo() {
    const [items, setItems] = useState(PAGES);
    return (
        <Tabs
            ariaLabel="Open files"
            items={items}
            activeId="about"
            onClose={(id) => setItems((list) => list.filter((t) => t.id !== id))}
            closeLabel={(label) => `Close ${label}`}
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
                    "Scrollable tab strip (neutral, no MUI). With `href`: real links inside a `<nav>` with `aria-current=page` (the URL is authoritative: direct link, reload and back/forward land on the right tab). Without `href`: `aria-pressed` buttons that call `onSelect` (panel switch). Long labels truncated (full title on hover), active tab scrolled into view, optional close button with an accessible label.",
            },
        },
    },
    args: { items: PANELS, activeId: "terminal", ariaLabel: "Panels" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PanelSwitch: Story = { render: () => <PanelDemo /> };
export const LinksWithClose: Story = { render: () => <ClosableDemo /> };
export const Overflow: Story = {
    render: () => (
        <div style={{ maxWidth: 320 }}>
            <Tabs
                ariaLabel="Open files"
                activeId="f6"
                items={Array.from({ length: 8 }, (_, i) => ({
                    id: `f${i}`,
                    label: `a-very-long-file-name-${i}.tsx`,
                }))}
                onSelect={() => {}}
            />
        </div>
    ),
};
