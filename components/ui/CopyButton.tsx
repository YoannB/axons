// components/ui/CopyButton.tsx
"use client";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { Icon } from "./Icon";

export function CopyButton({ text }: { text: string }) {
    const { copied, copy } = useCopyToClipboard();
    const t = useTranslations("showcase");
    return (
        <Button variant="ghost" size="sm" onClick={() => copy(text)} ariaLabel={t("copyLabel")}>
            <Icon name={copied ? "check" : "box"} size={16} animated /> {copied ? t("copyCopied") : t("copyLabel")}
        </Button>
    );
}
