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
                    Show the toast
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
                    "The project's neutral temporary notification. Each story shows on click (`Button`) to avoid stacked portals on the Docs page; severities are therefore checked story by story, since the facade anchors the toast in a single, ephemeral portal (a multi-toast grid is not relevant). Covers the public severities, short and long durations, long messages, manual dismissal and the opt-in countdown bar (`showProgress`, synced to `duration`). Anchored bottom-left so it does not overlap the sticky video at bottom-right; the Netlify anti-badge offset is set in the material CSS.",
            },
        },
    },
    argTypes: {
        id: {
            control: "text",
            description: "Toast id, passed to the onDismiss callback on close.",
        },
        severity: {
            control: "select",
            options: ["info", "success", "warning", "error"],
            description: "Visual and semantic severity of the message.",
        },
        message: {
            control: "text",
            description: "Text content shown in the toast.",
        },
        duration: {
            control: { type: "number", min: 1000, step: 500 },
            description:
                "Auto-hide duration in milliseconds. By default, the facade uses 4000 ms. Also used as the countdown bar duration when showProgress is on.",
        },
        showProgress: {
            control: "boolean",
            description:
                "Shows a linear countdown bar over the display duration (aligned with autoHideDuration). Opt-in: default false, historical rendering unchanged. Remounting via `key` replays the bar on every opening.",
        },
        onDismiss: {
            table: { disable: true },
            description:
                "Callback called when the toast is closed manually or automatically. Disabled in the Storybook controls because the stories use a local demo state.",
        },
    },
    args: {
        id: "toast-example",
        severity: "info",
        message: "Change saved.",
        duration: 4000,
        showProgress: false,
        onDismiss: noop,
    },
    render: (args) => <StatefulToast {...args} />,
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
    args: { severity: "info", message: "Some information is available." },
};

export const Success: Story = {
    args: {
        severity: "success",
        message: "The action completed successfully.",
    },
};

export const Warning: Story = {
    args: {
        severity: "warning",
        message: "Some fields need your attention.",
    },
};

export const Error: Story = {
    args: {
        severity: "error",
        message: "The service is temporarily unavailable.",
    },
};

export const ShortDuration: Story = {
    args: {
        severity: "info",
        message: "This toast disappears quickly.",
        duration: 1500,
    },
};

export const LongDuration: Story = {
    args: {
        severity: "success",
        message: "This toast stays visible longer.",
        duration: 10000,
    },
};

export const LongMessage: Story = {
    args: {
        severity: "warning",
        message:
            "This is a deliberately long message to check readability, bottom-left anchoring and the toast's behavior when the text spans more than one line.",
        duration: 8000,
    },
};

export const ManualDismissal: Story = {
    args: {
        severity: "error",
        message:
            "Manual dismissal is possible via the toast's cross. The duration is extended to make checking easier.",
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
        message: "Countdown bar visible for the whole display duration.",
        duration: 8000,
        showProgress: true,
    },
};
