// components/ui/Section.tsx
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Section({
    id,
    title,
    icon,
    children,
    className,
}: {
    id?: string;
    title?: ReactNode;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section id={id} className={cn("section", className)}>
            {title && (
                <h2 className="section__title">
                    {icon}
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}
