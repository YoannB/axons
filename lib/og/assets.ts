import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { dataUri, type OgFont } from "./model";

// Axons' default social-image assets. Every path is a LITERAL `path.join(process.cwd(), …)` so the
// file tracer ships the file with the function (docs/seo-layout.md → Social images). The images
// are prerendered at build time anyway; the trace only matters if one is ever rendered on demand.
// Geist (Vercel, SIL Open Font License 1.1, assets/og/OFL.txt) covers the accented Latin of the
// six supported locales.

export const AXONS_OG_FONT_FAMILY = "Geist";

let fonts: Promise<readonly OgFont[]> | undefined;

/** Geist Regular (400) + Bold (700), read once per process. */
export function loadAxonsOgFonts(): Promise<readonly OgFont[]> {
    fonts ??= Promise.all([
        readFile(path.join(process.cwd(), "assets", "og", "Geist-Regular.ttf")),
        readFile(path.join(process.cwd(), "assets", "og", "Geist-Bold.ttf")),
    ]).then(([regular, bold]) => [
        { name: AXONS_OG_FONT_FAMILY, data: toArrayBuffer(regular), weight: 400, style: "normal" },
        { name: AXONS_OG_FONT_FAMILY, data: toArrayBuffer(bold), weight: 700, style: "normal" },
    ]);
    return fonts;
}

/** The site's favicon (site/icon.svg) as a data: URI: the default logo of the image. */
export async function loadSiteIcon(): Promise<string> {
    return dataUri("image/svg+xml", await readFile(path.join(process.cwd(), "site", "icon.svg")));
}

const toArrayBuffer = (bytes: Buffer): ArrayBuffer =>
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
