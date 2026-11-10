// components/ui/material/Breadcrumb.tsx
"use client";
import MuiBreadcrumb from "@mui/material/Breadcrumbs";
import Link from "next/link";
import type { AppBreadcrumbItem } from "../types";
export function Breadcrumb({ items }: { items: AppBreadcrumbItem[] }) {
    return (
        <MuiBreadcrumb separator="/" aria-label="breadcrumb">
            {items.map((it, i) =>
                it.href && i < items.length - 1 ? (
                    <Link key={i} href={it.href} className="bc-link">
                        {it.label}
                    </Link>
                ) : (
                    <span key={i} aria-current={i === items.length - 1 ? "page" : undefined}>
                        {it.label}
                    </span>
                ),
            )}
        </MuiBreadcrumb>
    );
}
