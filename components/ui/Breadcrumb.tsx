// components/ui/Breadcrumb.tsx
"use client";
import { Breadcrumb as MuiBreadcrumb } from "./material/Breadcrumb";
import type { AppBreadcrumbItem } from "./types";

export function Breadcrumb({ items }: { items: AppBreadcrumbItem[] }) {
    return <MuiBreadcrumb items={items} />;
}
