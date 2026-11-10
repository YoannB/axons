"use client";
import { Button, Tabs, Terminal, type AppTerminalLine, type AppTerminalLineKind } from "@/components/ui";
import { useScriptedSequence } from "@/hooks/use-scripted-sequence";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Demo of Tabs (panel mode) + Terminal + useScriptedSequence: a purely SIMULATED sequence
// (no network, no AI call), the pattern behind a "generate a site" animation.
const PANELS = ["terminal", "output", "problems"] as const;
type Panel = (typeof PANELS)[number];
const PANEL_LABEL = { terminal: "tabTerminal", output: "tabOutput", problems: "tabProblems" } as const;
// Line kinds by position in the localized script (first = the command, last = the result).
const kindAt = (i: number, last: number): AppTerminalLineKind =>
    i === 0 ? "command" : i === last ? "success" : "output";

export function TerminalShowcase() {
    const t = useTranslations("showcase");
    const [panel, setPanel] = useState<Panel>("terminal");
    const script = t.raw("terminalLines") as string[];
    const lines: AppTerminalLine[] = script.map((text, i) => ({
        id: String(i),
        text,
        kind: kindAt(i, script.length - 1),
    }));
    const seq = useScriptedSequence(lines.length);
    const running = seq.status === "running";

    return (
        <div className="term-demo">
            <Tabs
                ariaLabel={t("tabsLabel")}
                activeId={panel}
                onSelect={(id) => setPanel(id as Panel)}
                items={PANELS.map((p) => ({ id: p, label: t(PANEL_LABEL[p]) }))}
            />
            {panel === "terminal" ? (
                <Terminal
                    ariaLabel={t("terminalTitle")}
                    title={t("terminalTitle")}
                    lines={lines.slice(0, seq.shown)}
                    running={running}
                    rows={6}
                    actions={
                        <>
                            <Button size="sm" variant="primary" onClick={seq.start} disabled={running}>
                                {t("terminalRun")}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={seq.reset} disabled={seq.status === "idle"}>
                                {t("terminalReset")}
                            </Button>
                        </>
                    }
                />
            ) : (
                <p className="term-demo__empty">{t(panel === "output" ? "outputEmpty" : "problemsEmpty")}</p>
            )}
        </div>
    );
}
