// components/ui/EditorPair.tsx — two equal side-by-side panes (generic layout, no MUI)
import { cn } from "@/lib/cn";
import type { AppEditorPairProps } from "./types";

// Source | result layout for text tools. Both columns sit in ONE grid row with equal
// tracks, so they keep the same width whatever their content; give the Textarea and the
// DiffView the same `rows` for the same body height. Below 900px it stacks: start, action,
// end. After a call, scroll the `endId` column into view from the success callback.
export function EditorPair({ start, end, startToolbar, endToolbar, action, endId, className }: AppEditorPairProps) {
    return (
        <div className={cn("editor-pair", className)}>
            <div className="editor-pair__col editor-pair__col--start">
                {startToolbar ? <div className="editor-pair__toolbar">{startToolbar}</div> : null}
                {start}
            </div>
            {action ? <div className="editor-pair__action">{action}</div> : null}
            <div id={endId} className="editor-pair__col editor-pair__col--end">
                {endToolbar ? <div className="editor-pair__toolbar">{endToolbar}</div> : null}
                {end}
            </div>
        </div>
    );
}
