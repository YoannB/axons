// @vitest-environment node
// Inline fixtures, no fs: every fixture is built by a function, never parsed at module top level
// (see the closing `---` gotcha in docs/testing.md).
import {
    buildCatalog,
    findArticle,
    listArticles,
    parseArticleFile,
    resolveTranslation,
    splitFrontMatter,
    type ArticleFile,
} from "@/lib/articles/parse";
import { describe, expect, it } from "vitest";

const md = (header: string, body = "Body.") => `---\n${header}\n---\n\n${body}\n`;
const header = (o: Record<string, string> = {}) =>
    Object.entries({ title: "Title", slug: "my-slug", date: "2026-11-10", description: "Desc", ...o })
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
const file = (id: string, locale: string, o: Record<string, string> = {}): ArticleFile => ({
    id,
    locale,
    raw: md(header(o)),
});

describe("splitFrontMatter", () => {
    it("sépare l'entête YAML du corps (corps rogné)", () => {
        expect(splitFrontMatter("---\na: 1\n---\n\n# Hi\n\n", "f")).toEqual({ data: { a: 1 }, body: "# Hi" });
    });

    it("tolère le BOM et les fins de ligne CRLF", () => {
        expect(splitFrontMatter("﻿---\r\na: x\r\n---\r\nBody", "f")).toEqual({ data: { a: "x" }, body: "Body" });
    });

    it("refuse un fichier sans --- initial", () => {
        expect(() => splitFrontMatter("a: 1\n---\nBody", "x/en.md")).toThrow(/x\/en\.md.*entête YAML absente/);
    });

    it("refuse une entête non fermée", () => {
        expect(() => splitFrontMatter("---\na: 1\nBody", "f")).toThrow(/non fermée/);
    });
});

describe("parseArticleFile — succès", () => {
    it("lit les champs requis, date non citée comprise (YAML 1.2 : reste une chaîne)", () => {
        expect(parseArticleFile(file("demo", "fr"))).toEqual({
            id: "demo",
            locale: "fr",
            slug: "my-slug",
            title: "Title",
            description: "Desc",
            date: "2026-11-10",
            body: "Body.",
        });
    });

    it("accepte une date citée et une image absolue", () => {
        const article = parseArticleFile(file("demo", "en", { date: '"2026-01-31"', image: "/articles/demo/c.png" }));
        expect(article.date).toBe("2026-01-31");
        expect(article.image).toBe("/articles/demo/c.png");
    });
});

describe("parseArticleFile — erreurs", () => {
    it("refuse un identifiant de dossier invalide", () => {
        expect(() => parseArticleFile(file("Bad_Id", "en"))).toThrow(/identifiant de dossier invalide/);
    });

    it("refuse une entête vide", () => {
        expect(() => parseArticleFile({ id: "demo", locale: "en", raw: md("") })).toThrow(/doit être un objet/);
    });

    it("refuse une entête scalaire", () => {
        expect(() => parseArticleFile({ id: "demo", locale: "en", raw: md("just text") })).toThrow(
            /doit être un objet/,
        );
    });

    it("refuse une entête liste", () => {
        expect(() => parseArticleFile({ id: "demo", locale: "en", raw: md("- a\n- b") })).toThrow(/doit être un objet/);
    });

    it("refuse un champ requis manquant", () => {
        const raw = md("title: T\ndate: 2026-11-10\ndescription: D");
        expect(() => parseArticleFile({ id: "demo", locale: "en", raw })).toThrow(/« slug » requis/);
    });

    it("refuse un champ requis vide ou non textuel", () => {
        expect(() => parseArticleFile(file("demo", "en", { title: '"  "' }))).toThrow(/« title » requis/);
        expect(() => parseArticleFile(file("demo", "en", { description: "42" }))).toThrow(/« description » requis/);
    });

    it("refuse un slug invalide", () => {
        expect(() => parseArticleFile(file("demo", "en", { slug: "Not-OK" }))).toThrow(/slug « Not-OK » invalide/);
    });

    it("refuse une date mal formée", () => {
        expect(() => parseArticleFile(file("demo", "en", { date: "10/11/2026" }))).toThrow(/date « 10\/11\/2026 »/);
    });

    it("refuse une date impossible (mois hors bornes => Invalid Date)", () => {
        expect(() => parseArticleFile(file("demo", "en", { date: "2026-13-45" }))).toThrow(/date « 2026-13-45 »/);
    });

    it("refuse une date qui déborde sur le mois suivant (30 février)", () => {
        expect(() => parseArticleFile(file("demo", "en", { date: "2026-02-30" }))).toThrow(/date « 2026-02-30 »/);
    });

    it("refuse une image relative", () => {
        expect(() => parseArticleFile(file("demo", "en", { image: "cover.png" }))).toThrow(/chemin absolu/);
    });

    it("refuse une image vide", () => {
        expect(() => parseArticleFile(file("demo", "en", { image: '""' }))).toThrow(/« image » requis/);
    });

    it("refuse un corps vide", () => {
        expect(() => parseArticleFile({ id: "demo", locale: "en", raw: md(header(), "   ") })).toThrow(
            /corps Markdown vide/,
        );
    });
});

describe("buildCatalog", () => {
    it("regroupe les traductions par article et ignore les locales non servies", () => {
        const catalog = buildCatalog(
            [file("demo", "en", { slug: "hello" }), file("demo", "fr", { slug: "bonjour" }), file("demo", "de")],
            ["en", "fr"],
        );
        expect(catalog).toHaveLength(1);
        expect(Object.keys(catalog[0].translations)).toEqual(["en", "fr"]);
    });

    it("abandonne un article sans aucune traduction servie", () => {
        expect(buildCatalog([file("demo", "de")], ["en"])).toEqual([]);
    });

    it("refuse un slug en double dans une même locale", () => {
        expect(() => buildCatalog([file("one", "en"), file("two", "en")], ["en"])).toThrow(
            /two\/en\.md.*déjà utilisé par « one »/,
        );
    });

    it("autorise le même slug dans deux locales différentes", () => {
        expect(buildCatalog([file("one", "en"), file("one", "fr")], ["en", "fr"])).toHaveLength(1);
    });

    it("trie du plus récent au plus ancien (date la plus récente des traductions), puis par id", () => {
        const catalog = buildCatalog(
            [
                file("old", "en", { slug: "old", date: "2025-01-01" }),
                file("b-tie", "en", { slug: "b", date: "2026-05-05" }),
                file("updated", "en", { slug: "u", date: "2024-01-01" }),
                file("updated", "fr", { slug: "u", date: "2026-06-06" }),
                file("a-tie", "en", { slug: "a", date: "2026-05-05" }),
            ],
            ["en", "fr"],
        );
        expect(catalog.map((e) => e.id)).toEqual(["updated", "a-tie", "b-tie", "old"]);
    });
});

describe("resolveTranslation / listArticles / findArticle", () => {
    const catalog = () =>
        buildCatalog(
            [
                file("both", "en", { slug: "hello", date: "2026-03-01" }),
                file("both", "fr", { slug: "bonjour", date: "2026-03-01" }),
                file("fr-only", "fr", { slug: "seulement", date: "2026-02-01" }),
                file("es-only", "es", { slug: "solo", date: "2026-01-01" }),
            ],
            ["fr", "en", "es"],
        );

    it("prend la traduction de la locale visitée", () => {
        expect(resolveTranslation(catalog()[0], "fr", "en", ["fr", "en", "es"])).toMatchObject({
            article: { locale: "fr", slug: "bonjour" },
            isFallback: false,
        });
    });

    it("se replie sur la locale par défaut", () => {
        expect(resolveTranslation(catalog()[0], "es", "en", ["fr", "en", "es"])).toMatchObject({
            article: { locale: "en" },
            isFallback: true,
        });
    });

    it("sinon sur la première locale servie qui a une traduction", () => {
        expect(resolveTranslation(catalog()[2], "fr", "en", ["fr", "en", "es"])).toMatchObject({
            article: { locale: "es", slug: "solo" },
            isFallback: true,
        });
    });

    it("liste tout, ou les N plus récents avec une limite", () => {
        const all = listArticles(catalog(), "en", "en", ["fr", "en", "es"]);
        expect(all.map((l) => [l.article.id, l.article.locale, l.isFallback])).toEqual([
            ["both", "en", false],
            ["fr-only", "fr", true],
            ["es-only", "es", true],
        ]);
        expect(listArticles(catalog(), "en", "en", ["fr", "en", "es"], 2)).toHaveLength(2);
    });

    it("retrouve un article par le slug de SA locale uniquement", () => {
        expect(findArticle(catalog(), "fr", "bonjour")?.id).toBe("both");
        expect(findArticle(catalog(), "en", "bonjour")).toBeUndefined();
        expect(findArticle(catalog(), "de", "hello")).toBeUndefined();
    });
});
