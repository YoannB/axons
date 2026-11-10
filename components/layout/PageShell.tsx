import { AdSlot, Container } from "@/components/ui";
import { AD_SIZES } from "@/constants/site";
import type { ReactNode } from "react";

// Page wrapper: left ad rail (160x600) + content (<=1280px) + right ad rail (300x600).
// AdSlot is a Client Component; only primitives are passed here (w, h, label),
// so it is serializable. In production, AdSlot renders null until real tags exist.
export function PageShell({ children }: { children: ReactNode }) {
    const { verticalLeft: vl, verticalRight: vr } = AD_SIZES;
    return (
        <div className="page-shell">
            <aside className="page-shell__rail page-shell__rail--left">
                <AdSlot w={vl.w} h={vl.h} label="rail-left" />
            </aside>
            <Container>{children}</Container>
            <aside className="page-shell__rail page-shell__rail--right">
                <AdSlot w={vr.w} h={vr.h} label="rail-right" />
            </aside>
        </div>
    );
}
