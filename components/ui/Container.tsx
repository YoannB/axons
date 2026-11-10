// components/ui/Container.tsx  — wrapper 1280px
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("container", className)}>{children}</div>;
}
