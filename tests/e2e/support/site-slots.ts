import { readFileSync } from "node:fs";
import path from "node:path";

// Which Axons component slots the site kept (docs/architecture.md → Deriving a site). Specs that
// exercise Axons' OWN home content (hero, showcase, AI demo) skip when a derived site replaced the
// home body in site/home.tsx; read as text, so no component code is loaded into Playwright.
const slot = (file: string) => readFileSync(path.join(process.cwd(), "site", file), "utf8");

/** true when site/home.tsx still re-exports Axons' home body. */
export const AXONS_HOME = /\bAxonsHome\b/.test(slot("home.tsx"));
export const AXONS_HOME_SKIP = "the site replaced Axons' home body (site/home.tsx)";
