// components/ui/Card.tsx
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
    children,
    className,
    as: As = "div",
}: {
    children: ReactNode;
    className?: string;
    as?: "div" | "article" | "li";
}) {
    return <As className={cn("card", className)}>{children}</As>;
}
