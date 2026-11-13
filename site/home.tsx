// THE SITE'S HOME BODY — owned by a derived site (replace the export, keep its name).
// app/[locale]/page.tsx renders `<SiteHome locale={locale} />` inside the frame (site/shell.tsx);
// the home metadata stays in the page (`meta.home` messages, overridable through
// SITE.messageOverrides). Contract: `SiteHomeProps` (lib/site-extension.ts).
export { AxonsHome as SiteHome } from "@/components/home/AxonsHome";
