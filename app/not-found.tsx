import { EmptyUniverse } from "@/components/ui/EmptyUniverse";
import Link from "next/link";

// Root 404: only for paths that resolve to NO locale (e.g. /file.ext with an unknown first
// segment, which the middleware matcher skips). It renders inside the root layout WITHOUT the
// [locale] providers, so there are no messages: a language-neutral page, and the splash is
// hidden by CSS (`body:has(.root-not-found) #app-splash`), never removed from the DOM.
export default function RootNotFound() {
    return (
        <main className="root-not-found not-found">
            <EmptyUniverse />
            <h1 className="not-found__code">404</h1>
            <Link href="/" className="latest-articles__all">
                ← Home
            </Link>
        </main>
    );
}
