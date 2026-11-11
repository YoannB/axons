// components/ui/DiffView.stories.tsx
import { diffWords } from "@/lib/text/diff";
import type { Meta, StoryObj } from "@storybook/react";
import { DiffLegend, DiffView } from "./DiffView";

const LABELS = { insert: "Added", replace: "Fixed", delete: "Removed" };
const BEFORE = "Thank you for you feedback, I will send the corected document tomorow morning";
const AFTER = "Thank you for your feedback, I will send the corrected document tomorrow morning.";

const meta = {
    title: "UI/DiffView",
    component: DiffView,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Read-only rendering of a word-level diff (`lib/text/diff`). Each op becomes a React text node inside `<ins>` / `<del>` / `<mark>`: never innerHTML, so a model reply cannot inject markup. Fixed height derived from `rows` (same box as the Textarea), scrolling beyond. Focusable region (`role=region` + `aria-label`). A replacement's title shows the old text.",
            },
        },
    },
    argTypes: {
        ops: { control: false, description: "Ops produced by `diffWords(before, after)`." },
        ariaLabel: { control: "text", description: "Accessible name of the region." },
        placeholder: { control: "text", description: "Shown when `ops` is empty." },
        hideDeletions: { control: "boolean", description: 'Hides the deleted text ("after" text only).' },
        rows: { control: { type: "number", min: 2, max: 12 }, description: "Visible lines (fixed height)." },
    },
    args: {
        ops: diffWords(BEFORE, AFTER),
        ariaLabel: "Corrected text",
        labels: LABELS,
        rows: 4,
    },
    render: (args) => (
        <div style={{ display: "grid", gap: 10, maxWidth: 560 }}>
            <DiffLegend labels={LABELS} />
            <DiffView {...args} />
        </div>
    ),
} satisfies Meta<typeof DiffView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const HideDeletions: Story = { args: { hideDeletions: true } };
export const Empty: Story = {
    args: { ops: [], placeholder: "Run the tool to see the result here." },
};
export const Identical: Story = { args: { ops: diffWords(AFTER, AFTER) } };
export const Overflow: Story = {
    args: {
        rows: 2,
        ops: diffWords(`${BEFORE}\n${BEFORE}\n${BEFORE}`, `${AFTER}\n${AFTER}\n${AFTER}`),
    },
};
export const InjectedMarkupStaysText: Story = {
    args: { ops: diffWords("Hello", 'Hello <img src=x onerror="alert(1)">') },
    parameters: {
        docs: {
            description: { story: "Markup returned by a model is displayed as text, never as HTML." },
        },
    },
};
