"use client";
import {
    AiNotice,
    Button,
    Chip,
    ChoiceChips,
    ConfirmDialog,
    CopyButton,
    DiffLegend,
    DiffView,
    EditorPair,
    Gauge,
    Icon,
    Textarea,
    type AppTone,
} from "@/components/ui";
import { AI_ENABLED } from "@/constants/site";
import { useDirtyGuard } from "@/hooks/use-dirty-guard";
import { diffWords } from "@/lib/text/diff";
import { bandFor, similarityPercent, type DefaultBandKey } from "@/lib/text/similarity";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

// Demo of the generic text-tool kit (docs/text-tools.md). NO AI call: the "after" text is a
// fixed reference per example, and the diff is recomputed at render from what the user
// types. A real tool replaces the reference with the model reply, received through
// useAiCall's onSuccess, and keeps the rest of this composition as is.
const PRESETS = ["typo", "punctuation"] as const;
type Preset = (typeof PRESETS)[number];

const MAX_CHARS = 500;
const ROWS = 5;

const TONE: Record<DefaultBandKey, AppTone> = {
    perfect: "success",
    great: "success",
    good: "warning",
    low: "error",
};

export function TextToolsShowcase() {
    const t = useTranslations("textTools");
    const tn = useTranslations("aiNotice");
    const [preset, setPreset] = useState<Preset | null>("typo");
    const [input, setInput] = useState(() => t("examples.typo.before"));

    const reference = preset ? t(`examples.${preset}.after`) : "";
    const ops = useMemo(() => (preset ? diffWords(input, reference) : []), [preset, input, reference]);
    const percent = preset ? similarityPercent(ops, input, reference) : 0;
    const band = bandFor<DefaultBandKey>(percent);

    // Dirty = the user typed something that is neither empty nor the loaded example.
    const loaded = preset ? t(`examples.${preset}.before`) : "";
    const guard = useDirtyGuard(input.trim() !== "" && input !== loaded);

    const legend = { insert: t("legend.insert"), replace: t("legend.replace"), delete: t("legend.delete") };

    return (
        <section id="text-tools" className="text-tools card" aria-labelledby="text-tools-title">
            <h2 id="text-tools-title" className="showcase__title">
                <Icon name="code" size={18} /> {t("title")}
            </h2>
            <p className="text-tools__intro">{t("intro")}</p>
            <EditorPair
                endId="text-tools-result"
                startToolbar={
                    <>
                        <ChoiceChips
                            ariaLabel={t("presetsLabel")}
                            value={preset}
                            options={PRESETS.map((p) => ({ value: p, label: t(`presets.${p}`) }))}
                            onChange={(p) =>
                                guard.run(() => {
                                    setPreset(p);
                                    setInput(t(`examples.${p}.before`));
                                })
                            }
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                guard.run(() => {
                                    setPreset(null);
                                    setInput("");
                                })
                            }
                        >
                            {t("reset")}
                        </Button>
                    </>
                }
                start={
                    <Textarea
                        id="text-tools-source"
                        label={t("sourceLabel")}
                        value={input}
                        onChange={setInput}
                        placeholder={t("sourcePlaceholder")}
                        rows={ROWS}
                        maxLength={MAX_CHARS}
                        showCount
                    />
                }
                endToolbar={
                    <>
                        <DiffLegend labels={legend} />
                        <CopyButton text={reference} disabled={!preset} />
                    </>
                }
                end={
                    <DiffView
                        ops={ops}
                        rows={ROWS}
                        ariaLabel={t("resultLabel")}
                        placeholder={t("resultPlaceholder")}
                        labels={legend}
                    />
                }
                action={
                    <div className="text-tools__score">
                        <Gauge
                            value={percent}
                            size={72}
                            tone={preset ? TONE[band.key] : "default"}
                            label={t("similarity")}
                        />
                        {preset ? <Chip label={t(`bands.${band.key}`)} color={TONE[band.key]} /> : null}
                        {/* Disclosure only when a real AI call exists on the site (spec: never imply one). */}
                        {AI_ENABLED ? (
                            <AiNotice
                                className="text-tools__notice"
                                items={[tn("thirdParty", { provider: "OpenRouter" }), tn("quality"), tn("wait")]}
                            />
                        ) : null}
                    </div>
                }
            />
            <ConfirmDialog
                open={guard.open}
                onClose={guard.cancel}
                onConfirm={guard.confirm}
                title={t("confirmTitle")}
                message={t("confirmMessage")}
                confirmLabel={t("confirmOk")}
                cancelLabel={t("confirmCancel")}
                tone="danger"
            />
        </section>
    );
}
