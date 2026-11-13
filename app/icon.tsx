import { readFileSync } from "node:fs";
import path from "node:path";

// Favicon owned by the SITE: site/icon.svg (a derived site replaces that file, never this one).
// Generated at build time (no request data), served as SVG. The literal path is traced.
export const contentType = "image/svg+xml";

export default function Icon() {
    return new Response(readFileSync(path.join(process.cwd(), "site", "icon.svg")), {
        headers: { "Content-Type": contentType },
    });
}
