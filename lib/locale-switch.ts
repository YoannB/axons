// PURE: where the language switcher goes for a given LOGICAL pathname (next-intl `usePathname`).
// Static routes keep their logical key (routing translates it). A dynamic route ending with
// `/[param]` (e.g. "/articles/[slug]") has a DIFFERENT param per locale (translated slug): it is
// read from the page's own hreflang alternate for the target locale (`<link rel="alternate">`,
// emitted by generateMetadata, single source of truth). No alternate => the page does not
// exist in that locale: go to the parent route (e.g. the article listing) instead of a 404.
export interface SwitchTarget {
    pathname: string;
    params?: Record<string, string>;
}

const TRAILING_PARAM = /^(.*)\/\[([^\]/]+)\]$/;

export function switchTarget(pathname: string, alternateHref: string | null): SwitchTarget {
    if (!pathname.includes("[")) return { pathname };
    const match = TRAILING_PARAM.exec(pathname);
    if (!match) return { pathname: "/" };
    const [, parent, param] = match;
    const segment = alternateHref ? new URL(alternateHref, "http://localhost").pathname.split("/").pop() : "";
    if (!segment) return { pathname: parent || "/" };
    return { pathname, params: { [param]: decodeURIComponent(segment) } };
}
