import { notFound } from "next/navigation";

// Catch-all for unknown paths UNDER a locale (e.g. /fr/anything): without it Next falls back to
// its default 404 OUTSIDE app/[locale]/layout.tsx, so the providers, the chrome and SplashLoader
// never mount and the pre-hydration splash stays on screen. notFound() here renders
// app/[locale]/not-found.tsx inside the segment layout (next-intl's documented pattern).
export default function CatchAllPage() {
    notFound();
}
