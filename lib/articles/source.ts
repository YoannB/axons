import "server-only";
import { routing } from "@/i18n/routing";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { buildCatalog, findArticle, listArticles, type ArticleEntry, type ArticleFile } from "./parse";

// IO side of the articles (the pure logic is lib/articles/parse.ts, unit-tested).
// Layout: content/articles/<id>/<locale>.md, read via process.cwd(). The routes are rendered on
// demand (the root layout resolves the locale per request), so the files must ship with the
// server function: the literal `process.cwd()/content/articles` pattern is picked up by the file
// tracer (checked in .next/server/app/**/page.js.nft.json), like capabilities/.
const ROOT = path.join(process.cwd(), "content", "articles");

function readFiles(): ArticleFile[] {
    const dirs = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
    return dirs.flatMap((dir) =>
        readdirSync(path.join(ROOT, dir.name))
            .filter((name) => name.endsWith(".md"))
            .map((name) => ({
                id: dir.name,
                locale: name.slice(0, -3),
                raw: readFileSync(path.join(ROOT, dir.name, name), "utf8"),
            })),
    );
}

// Parsed once per render pass (React cache), validated fail-fast by buildCatalog.
export const getCatalog = cache((): ArticleEntry[] => buildCatalog(readFiles(), routing.locales));

export function getArticles(locale: string, limit?: number) {
    return listArticles(getCatalog(), locale, routing.defaultLocale, routing.locales, limit);
}

export function getArticle(locale: string, slug: string) {
    return findArticle(getCatalog(), locale, slug);
}
