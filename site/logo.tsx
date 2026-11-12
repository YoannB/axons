// THE SITE'S LOGO MARK — owned by a derived site (replace the drawing, keep the two exports).
// components/ui/Logo.tsx wraps it in the <svg> (size, `logo` class, role="img",
// aria-label={SITE_NAME}): draw only the CONTENT here, in LOGO_VIEWBOX coordinates. The
// `logo__*` classes are animated by styles/ui/logo.css; a site may use its own classes
// (styled in site/theme.css) or none. The favicon is site/icon.svg (served by app/icon.tsx).
export const LOGO_VIEWBOX = "0 0 48 48";

// The pulse travels the axon BACK AND FORTH (keyPoints 0;1;0) instead of looping
// 0->1->0 by teleporting: no more visible jump at the end of the run. keySplines
// softens the ends. The orbit and the core already loop symmetrically (no jump).
export function LogoMark() {
    return (
        <>
            <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent-1)" />
                    <stop offset="100%" stopColor="var(--accent-2)" />
                </linearGradient>
            </defs>
            <circle className="logo__orbit" cx="24" cy="24" r="18" />
            <path className="logo__axon" d="M10 30 C 18 30, 18 18, 26 18 S 36 26, 38 16" />
            <circle className="logo__pulse" r="2.6" cx="0" cy="0">
                <animateMotion
                    dur="3.2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyPoints="0;1;0"
                    keyTimes="0;0.5;1"
                    keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                    path="M10 30 C 18 30, 18 18, 26 18 S 36 26, 38 16"
                />
            </circle>
            <path className="logo__core" d="M24 12 L33 33 H15 Z" fill="url(#logoGrad)" />
        </>
    );
}
