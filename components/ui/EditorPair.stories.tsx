// components/ui/EditorPair.stories.tsx
import { diffWords } from "@/lib/text/diff";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AiNotice } from "./AiNotice";
import { Button } from "./Button";
import { DiffView } from "./DiffView";
import { EditorPair } from "./EditorPair";
import { Textarea } from "./Textarea";

const REFERENCE = "Hello Mary, I am getting back to you about the quote: is it still valid?";

function Demo({ withAction }: { withAction: boolean }) {
    const [text, setText] = useState("Hello Mary I am getting back to you about the quote is it still valid");
    return (
        <EditorPair
            endId="story-result"
            startToolbar={<strong>Source</strong>}
            endToolbar={<strong>Result</strong>}
            start={<Textarea label="Your text" value={text} onChange={setText} rows={5} maxLength={300} showCount />}
            end={<DiffView ops={diffWords(text, REFERENCE)} ariaLabel="Result" rows={5} />}
            action={
                withAction ? (
                    <div style={{ display: "grid", gap: 8 }}>
                        <Button variant="primary" fullWidth>
                            Run
                        </Button>
                        <AiNotice items={["The text is sent to a third-party AI provider."]} />
                    </div>
                ) : undefined
            }
        />
    );
}

const meta = {
    title: "UI/EditorPair",
    component: EditorPair,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component:
                    "Source | result layout for text tools: two equal columns on a single grid row (same width whatever the content; give the Textarea and the DiffView the same `rows` for the same height). Below 900 px: stacked source, action, result. `endId` is the scroll target after a call. Resize the canvas to see the stacking.",
            },
        },
    },
    args: { start: null, end: null },
} satisfies Meta<typeof EditorPair>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = { render: () => <Demo withAction /> };
export const WithoutAction: Story = { render: () => <Demo withAction={false} /> };
