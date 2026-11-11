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
    showcase: { dialogClose: "Close" },
} as unknown as ComponentProps<typeof NextIntlClientProvider>["messages"];

const withTranslations = (Story: ComponentType) => (
    <NextIntlClientProvider locale="en" messages={fallbackMessages}>
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
                    Open the dialog
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
                    "The project's neutral dialog. Each story opens on click (`Button`) to avoid stacked portals on the Docs page; each variant's content stays verifiable on its own. Covers the open/closed state, with or without title and footer, long content and confirmation actions. The close cross is animated via the material CSS (`.dialog-close`) and carries an aria-label provided by next-intl.",
            },
        },
    },
    argTypes: {
        open: {
            control: "boolean",
            description: "Initial open state. `false` by default to preserve the Docs page.",
        },
        title: {
            control: "text",
            description: "Optional dialog title.",
        },
        children: {
            table: { disable: true },
            description: "Main dialog content.",
        },
        footer: {
            table: { disable: true },
            description: "Optional actions area, usually made of neutral buttons.",
        },
        onClose: {
            table: { disable: true },
            description: "Callback called on close via the cross, the backdrop or Escape.",
        },
    },
    args: {
        open: false,
        onClose: noop,
        title: "Confirm the action",
        children: "Do you really want to apply this change?",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Cancel
                </Button>
                <Button onClick={noop}>Confirm</Button>
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
            "This dialog has no title. The content stays accessible, but an explicit title is recommended for real cases.",
    },
};

export const WithoutFooter: Story = {
    args: {
        footer: undefined,
        children: "No footer action is provided. Closing happens via the cross, the backdrop or the Escape key.",
    },
};

export const LongContent: Story = {
    args: {
        title: "Terms of use",
        children: (
            <div style={{ display: "grid", gap: "1rem" }}>
                {Array.from({ length: 12 }, (_, index) => (
                    <p key={index}>
                        This is a demo paragraph meant to check how content scrolls inside a dialog. The content block
                        must stay readable without breaking the layout, even when the text is long.
                    </p>
                ))}
            </div>
        ),
    },
};

export const DestructiveAction: Story = {
    args: {
        title: "Delete the item",
        children: "This action cannot be undone. The selected item will be permanently deleted.",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={noop}>
                    Delete
                </Button>
            </>
        ),
    },
};

export const CustomFooter: Story = {
    args: {
        title: "Multiple selection",
        children: "The footer can hold several neutral actions, including secondary, ghost or primary buttons.",
        footer: (
            <>
                <Button variant="ghost" onClick={noop}>
                    Reset
                </Button>
                <Button variant="secondary" onClick={noop}>
                    Cancel
                </Button>
                <Button onClick={noop}>Apply</Button>
            </>
        ),
    },
};
