import { Breadcrumb, Card } from "@/components/ui";
import type { AppBreadcrumbItem } from "@/components/ui/types";
import type { ReactNode } from "react";

// Shared wrapper for the legal / sitemap pages.
// Breadcrumb is a Client Component: the props passed here (crumbs) are
// strictly serializable (array of { label, href? } objects), so the
// Server -> Client hand-off is valid. No state, no effect in this file.
export function StaticPage({
    title,
    intro,
    body,
    crumbs,
}: {
    title: string;
    intro?: ReactNode;
    body: ReactNode;
    crumbs: AppBreadcrumbItem[];
}) {
    return (
        <div className="static-page container">
            <Breadcrumb items={crumbs} />
            <Card className="static-page__card">
                <h1 className="static-page__title">{title}</h1>
                {intro ? <p className="muted">{intro}</p> : null}
                <div className="static-page__body prose">{body}</div>
            </Card>
        </div>
    );
}
