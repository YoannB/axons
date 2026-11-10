"use client";
import {
    Breadcrumb,
    Button,
    Chip,
    ConfirmDialog,
    CopyButton,
    Dialog,
    Gauge,
    Icon,
    Input,
    LanguageSwitcher,
    ResetLimiterButton,
    Textarea,
    ThemeToggle,
} from "@/components/ui";
import { useAiCall, type AiCallCtx } from "@/hooks/use-ai-call";
import { useStore } from "@/hooks/use-store";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Demo of the UNIFIED MODEL (docs/ai-capabilities.md): a single /api/run call combining
// prompt + agent + skill. The `msg` textarea is an OPTIONAL prompt (empty => fixed demo
// prompt). These constants live at MODULE level (no unstable closure) => stable reference =>
// the hook callback stays stable. The demo prompt is NOT a user label (it goes to the
// server, it is never displayed): it is therefore in English, consistent with model-facing files.
const RUN_DEMO_PROMPT = "Draft a one-line welcome label for the home hero.";
const RUN_BODY = ({ locale, input }: AiCallCtx) => ({
    prompt: input && input.trim() ? input : RUN_DEMO_PROMPT,
    agentId: "hello", // profile (system + execution params: precedence by source)
    skillId: "i18n-copy", // method (procedure + resources from the skill folder)
    inputs: { locale, namespace: "showcase" }, // vars interpolated by the agent AND the skill
});

export function ComponentShowcase() {
    const t = useTranslations("showcase");
    const store = useStore();
    // Two calls of the SAME hook (invariant: one hook, different endpoint). pending/canCall
    // are global: both buttons share the lock (one AI call at a time, on purpose).
    const { call, pending, canCall } = useAiCall();
    const { call: runCall } = useAiCall("/api/run", RUN_BODY);
    const [text, setText] = useState("");
    const [msg, setMsg] = useState("");
    const [dialog, setDialog] = useState(false);
    const [confirm, setConfirm] = useState(false);
    return (
        <div id="showcase" className="showcase card">
            <h3 className="showcase__title">
                <Icon name="box" size={18} /> {t("title")}
            </h3>
            <div className="showcase__grid">
                <div className="fld">
                    <label>{t("inputLabel")}</label>
                    <Input label="" value={text} onChange={setText} placeholder={t("inputPlaceholder")} />
                </div>
                <div className="fld">
                    <label>{t("textareaLabel")}</label>
                    <Textarea label="" value={msg} onChange={setMsg} placeholder={t("textareaPlaceholder")} />
                </div>
                <Button variant="primary" onClick={() => {}}>
                    {t("btnPrimary")}
                </Button>
                <Button variant="secondary" onClick={() => {}}>
                    {t("btnSecondary")}
                </Button>
                {/* 3 chips animated LIKE the hero pill (animated); the CSS staggers them. */}
                <div className="sg sg-chips">
                    <Chip label={t("chipInfo")} color="info" icon={<Icon name="sparkles" size={14} animated />} />
                    <Chip label={t("chipSuccess")} color="success" icon={<Icon name="check" size={14} animated />} />
                    <Chip
                        label={t("chipWarn")}
                        color="warning"
                        icon={<Icon name="bolt" size={14} animated />}
                        onDelete={() =>
                            store.pushToast({
                                severity: "info",
                                message: t("chipRemoved"),
                                duration: 2500,
                            })
                        }
                    />
                </div>
                <div className="sg sg-actions">
                    <Button
                        variant="ghost"
                        onClick={() => store.pushToast({ severity: "success", message: t("toastMsg") })}
                    >
                        <Icon name="check" size={15} /> {t("toastFire")}
                    </Button>
                    <Button variant="secondary" onClick={() => setDialog(true)}>
                        {t("dialogLabel")}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirm(true)}>
                        {t("confirmLabel")}
                    </Button>
                </div>
                <div className="showcase__gauge">
                    <Gauge value={78} label={t("gaugeLabel")} />
                </div>
                <div className="showcase__icons">
                    {(["star", "bolt", "heart", "shield", "clock"] as const).map((n) => (
                        <span key={n} className="ic">
                            <Icon name={n} animated />
                        </span>
                    ))}
                </div>
                <div className="sg sg-nav">
                    <Breadcrumb
                        items={[{ label: t("bcHome"), href: "/" }, { label: t("bcSection") }, { label: t("bcPage") }]}
                    />
                </div>
                <div className="sg sg-controls">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <CopyButton text="https://axons.netlify.app" />
                </div>
                <div className="sg sg-ai">
                    <Button
                        variant="primary"
                        loading={pending}
                        disabled={!canCall}
                        onClick={() => call(msg || undefined)}
                        iconLeft={<Icon name="sparkles" size={16} animated />}
                    >
                        {t("testAi")}
                    </Button>
                    {/* Demo of the unified prompt+agent+skill model via /api/run. Shares the global
              pending/canCall (single app-wide lock, on purpose). The msg textarea = optional prompt. */}
                    <Button
                        variant="secondary"
                        loading={pending}
                        disabled={!canCall}
                        onClick={() => runCall(msg || undefined)}
                        iconLeft={<Icon name="globe" size={16} animated />}
                    >
                        {t("runSkill")}
                    </Button>
                    <ResetLimiterButton />
                </div>
            </div>
            <Dialog open={dialog} onClose={() => setDialog(false)} title={t("dialogTitle")}>
                {t("dialogBody")}
            </Dialog>
            <ConfirmDialog
                open={confirm}
                onClose={() => setConfirm(false)}
                onConfirm={() => store.pushToast({ severity: "info", message: t("confirmOk") })}
                title={t("confirmLabel")}
                message={t("confirmQuestion")}
                confirmLabel={t("confirmOk")}
                cancelLabel={t("confirmCancel")}
            />
        </div>
    );
}
