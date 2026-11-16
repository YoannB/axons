# Articles & Markdown collections (content, localized URLs)

## Storage & front matter

One folder per article, one Markdown file per locale: `content/articles/<id>/<locale>.md`.
`<id>` is the STABLE identifier (kebab-case, never shown in a URL, never translated). Each file
opens with a YAML header closed by `---`:

```yaml
---
title: "Human title (page h1 + <title>)"
slug: translated-kebab-slug # last URL segment, unique per locale
date: 2026-11-10 # publication day YYYY-MM-DD (quoted or not: YAML 1.2 keeps it a string)
description: "One sentence: meta description, listing summary, social cards."
image: /articles/<id>/cover.png # optional, site-absolute, file in public/articles/<id>/
---
```

The body is GitHub-flavored Markdown. Prettier formats the prose but NOT the code inside
fenced blocks (`.prettierrc.json` override: `embeddedLanguageFormatting: "off"` for
`content/**/*.md`), so article snippets stay as written. Fenced code blocks name their language
(` ```js `, `ts`, `bash`/`sh`, `html`/`xml`, `css`, `scss`, `stylus`, `json`, `yaml`,
`markdown`, … — lowlight's `common` set + `stylus`); see _Code highlighting_ below. Do not repeat the title as `# Heading` (a body `h1` is
demoted to `h2`; the page title is the `h1`). Raw HTML in the body is NOT interpreted
(`react-markdown`, no `dangerouslySetInnerHTML`). For social cards prefer PNG/JPG covers: most
networks ignore SVG `og:image`.

Validation is fail-fast at BUILD time (`lib/articles/parse.ts`): a missing/empty field, a bad
slug or date, a relative image, an empty body, an unclosed header or a slug used twice in the
same locale throws with the file path. Never "fix" a failing build by catching that error.

## Code map

Axons' articles are the DEFAULT Markdown collection; everything below applies to every
collection (a derived site's "reminders", …), with `content/<collection>/` in place of
`content/articles/`. See _Collections_ for declaring one.

- `lib/articles/parse.ts` — PURE (no fs, no next-intl), 100% branch-covered by
  `tests/unit/articles-parse.test.ts`: front-matter split, validation, catalog (grouping, sort
  newest first by latest translation date then id), fallback resolution, listing, slug lookup.
- `lib/articles/source.ts` — `server-only` IO: reads `content/<collection>/` via `process.cwd()`,
  cached per render and collection (`React.cache`), feeds `routing.locales` /
  `routing.defaultLocale`. `getCollectionCatalog` / `getEntries` / `getEntry` take the collection
  id; `getCatalog` / `getArticles` / `getArticle` are the articles shortcuts.
- `components/content/CollectionPages.tsx` — page FACTORIES `collectionListing(id)` and
  `collectionEntry(id)` (metadata + page, `notFound()` when the collection is off or the slug is
  unknown). `app/[locale]/articles/page.tsx` and `app/[locale]/articles/[slug]/page.tsx` only
  delegate to them.
- `constants/site.ts` — `ARTICLES_COLLECTION`, `COLLECTIONS` (articles + `SITE.collections`,
  validated by `validateCollections` in `lib/site-extension.ts`), `getCollection`, `HIDDEN_HREFS`.
- `components/content/ArticleTeaser.tsx` (server-compatible card), `ArticleFeed.tsx` (server:
  date formatting + fallback badge), `ArticleBody.tsx` (Markdown renderer + server-side code highlighting);
  `components/home/LatestArticles.tsx` (3 most recent, renders nothing without articles).
- `lib/seo.ts` — `articleMetadata` / `articleJsonLd` (optional `itemHref` / `schemaType`) /
  `articlePath` / `entryPath`; `app/sitemap.ts` adds one entry per served translation of every
  ENABLED collection.

## Code highlighting

`ArticleBody` runs `rehype-highlight` (highlight.js grammars through lowlight) INSIDE the
Markdown render, so tokens are `<span class="hljs-…">` in the server HTML: no client JS, the
article stays a static Server Component. Colours are the `--code-*` tokens (`styles/tokens.css`,
dark + light overrides, every token >= 6:1 on `--bg-0`, i.e. AA) applied by `styles/articles.css`.
Auto-detection is OFF: a block without language, or with an unregistered one, stays plain text
(rehype-highlight records a vfile message, nothing throws). To support another language, import
its grammar from `highlight.js/lib/languages/<name>` and add it to `HIGHLIGHT_OPTIONS` in
`components/content/ArticleBody.tsx` (+ a case in `tests/unit/article-body.test.tsx`).
Chosen over Shiki: synchronous (fits `<Markdown>`, no `MarkdownAsync`), class-based (themeable
with tokens, no inline colours), ~6 MB installed vs ~11 MB (TextMate grammars + WASM engine).
`highlight.js` is a direct dependency only for the extra grammars: keep its range equal to the
one `lowlight` declares (`~11.11.0` today), or npm installs a second copy (`npm ls highlight.js`
must show `deduped`).

## Locales, fallback, SEO

Only SERVED locales count (`NEXT_PUBLIC_LOCALES`): files of other locales stay in the repo but
are not published; an article with no served translation is dropped. When the visited locale
has no translation, the listing shows the article in its fallback language (default locale,
else the first served one that has it) with a language badge, linking to the ORIGINAL's own URL (teaser hrefs are built by `entryPath`,
like the sitemap: no prefix for the default locale; next-intl `<Link locale>` would force one and
cost a 307 per click):
no duplicate page is ever generated. hreflang lists only the translations that exist; canonical
is the page's own locale URL; x-default is the default-locale version, else the page itself.
The article page also emits a schema.org `BlogPosting` (JSON-LD, `<` escaped).

Localized URL segments live in `i18n/pathnames.ts` (`/articles`, `/articles/[slug]`); the slug is
the per-locale front-matter `slug`. The language switcher cannot translate a slug by itself: on
a dynamic route it reads the page's own `<link rel="alternate" hreflang>` at click time
(`lib/locale-switch.ts`, pure) and falls back to the parent route (the listing) when the target
locale has no translation.

## Runtime & deploy

Routes under `[locale]` render on demand (the root layout resolves the locale per request), so
the Markdown files must ship with the server function. The literal
`path.join(process.cwd(), "content")` in `lib/articles/source.ts` is picked up by the file tracer,
which then ships the WHOLE `content/` folder (every collection) with each function importing it;
the collection folder is joined at run time. Verify in
`.next/server/app/[locale]/<route>/[slug]/page.js.nft.json` (every `content/**/*.md` listed). Keep
that literal form, never build the content root from a variable.

Collection entry routes have NO `generateStaticParams`, on purpose: nothing under `[locale]` is
prerendered anyway, and when a served locale had no entry at all Next classified the route as
SSG, so every entry page failed in production (500, `DYNAMIC_SERVER_USAGE`). Do not add it back. An unknown slug renders the 404 page as a SOFT 404 (HTTP 200 +
`robots: noindex`): `app/[locale]/loading.tsx` starts streaming before `notFound()` runs, the
same as every other page under `[locale]`.

## Turning the section off

`ARTICLES_ENABLED` (`site/config.ts` `articlesEnabled`, re-exported by `constants/site.ts`) is the single switch. `false` removes every article
surface at once: the `/articles` nav entry (header, footer, HTML sitemap page), the home
"latest articles" block, the `sitemap.xml` entries, and both routes (`notFound()`). `content/articles/` is left untouched (the files are simply not
published) and `tests/e2e/articles.spec.ts` skips itself. Do not delete the routes or the
`pathnames` entries to turn the section off: flipping the constant back must be enough.

## Collections (a derived site's own Markdown sections)

A collection = one entry in `SITE.collections` (`site/config.ts`) + its folder + its routes:

1. `content/<id>/<entry>/<locale>.md`, same front matter and rules as articles (`<id>` kebab-case).
2. Both routes in `SITE.pathnames`: the listing (e.g. `"/reminders"`) and the entry, ending with
   `/[slug]` (e.g. `"/reminders/[slug]"`, translated per locale like any pathname).
3. `{ id, enabled, href, itemHref, namespace, schemaType }` in `SITE.collections`: `enabled` is its
   on/off switch, `namespace` its messages (`title`, `intro`, `empty`, `publishedOn`, `onlyIn`, in
   every locale, in `site/messages/<locale>.json`), `schemaType` its JSON-LD type (`BlogPosting`,
   `TechArticle`, `Article`).
4. Two page files that only delegate:
   `app/[locale]/<route>/page.tsx` → `const page = collectionListing("<id>")`, exporting
   `generateMetadata = page.generateMetadata` and `default page.Page`;
   `app/[locale]/<route>/[slug]/page.tsx` → same with `collectionEntry("<id>")`.
5. Optionally a nav entry `{ href: "<listing href>", key: "nav.<id>" }` in `SITE.nav` (header,
   footer, HTML sitemap page).

Validation fails the build on a non kebab-case or duplicate id, a dynamic listing `href`, an
`itemHref` not ending with `/[slug]`, or a page file naming an unknown collection. A disabled
collection behaves like `ARTICLES_ENABLED = false`: both routes answer 404, its nav entry and its
`sitemap.xml` entries disappear (`HIDDEN_HREFS`). Fallback language, hreflang, canonical and
the slug-aware language switch work as for articles (the switcher reads the page's alternates).
The home "latest" block stays articles-only (`LatestArticles`); a site home can render
`<ArticleFeed items={getEntries("<id>", locale, 3)} namespace=… itemHref=… />`.

## Adding an article (one article = one PR)

Create `content/articles/<id>/` with one `<locale>.md` per supported locale (translate the
`slug`, keep `date` identical), put any image in `public/articles/<id>/`, run the Definition of
done, open a PR. The article is online after the Netlify redeploy of `main` (a few minutes),
not on a simple refresh. The E2E `tests/e2e/articles.spec.ts` relies on the two demo articles
(`writing-articles`, `architecture-tour`): a derived site replacing them updates that spec.
