"use client";
import { useDailyLimiter } from "@/hooks/use-daily-limiter";
import { useStore } from "@/hooks/use-store";
import { postJson } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Button } from "./Button";

const isDev = process.env.NODE_ENV === "development";

// Rendered ONLY in development (inlined as false in the production build). The reset used to be
// silent: it now raises an info toast (user intent ->
// handler, per "You Might Not Need an Effect": no setState in an effect).
// Resets BOTH counters: client (store) and server (`next dev` memory quota,
// via /api/dev/reset-quota) — otherwise the server would still answer 429.
export function ResetLimiterButton() {
    const { reset } = useDailyLimiter();
    const store = useStore();
    const t = useTranslations("showcase");
    if (!isDev) return null;
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
                reset();
                await postJson("/api/dev/reset-quota", {}).catch(() => undefined);
                store.pushToast({
                    severity: "info",
                    message: t("resetDone"),
                    duration: 3000,
                });
            }}
        >
            Reset limiteur (dev)
        </Button>
    );
}
