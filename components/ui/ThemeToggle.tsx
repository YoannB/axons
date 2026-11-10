// components/ui/ThemeToggle.tsx
"use client";
import { useTheme } from "@/hooks/use-theme";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

export function ThemeToggle() {
    const { mode, toggle } = useTheme();
    const t = useTranslations("theme");
    const label = mode === "system" ? t("system") : mode === "dark" ? t("dark") : t("light");
    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`${t("light")} / ${t("dark")}`}
            title={label}
        >
            <Icon name="palette" animated />
        </button>
    );
}
