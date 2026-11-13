// THE SITE'S PAGE FRAME — owned by a derived site (replace the export, keep its name).
// app/[locale]/layout.tsx renders `<SiteShell locale={locale}>{page}</SiteShell>` inside the
// providers; the cookie banner, GTM and the splash loader stay outside it. The frame owns the
// <main> landmark. Contract: `SiteShellProps` (lib/site-extension.ts). Axons uses its own frame
// (header + main + footer); a site may export a Server or a Client Component of its own.
export { DefaultShell as SiteShell } from "@/components/layout/DefaultShell";
