import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { SiteShellProps } from "@/lib/site-extension";

// Axons' page frame: header, the <main> landmark, footer. Rendered by app/[locale]/layout.tsx
// through `SiteShell` (site/shell.tsx), which re-exports it unless a derived site replaces it
// (docs/architecture.md → Deriving a site). The providers, the cookie banner, GTM and the splash
// loader stay in the layout, OUTSIDE the frame: a site's frame cannot drop them by accident.
export function DefaultShell({ children }: SiteShellProps) {
    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
        </>
    );
}
