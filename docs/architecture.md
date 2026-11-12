# Architecture & placement

## Three planes of "model-facing" content (do not conflate)

- `lib/ai/**` = CODE (parse, compose, network, error normalization). Imported normally.
- `capabilities/**` = CONTENT loaded BY THE APP at runtime via `readFileSync(process.cwd())`:
  `capabilities/agents/<id>.md` (one file per agent) and `capabilities/skills/<id>/` (one
  directory per skill, manifest `SKILL.md` + resource files). NOT imported → not bundled by
  the tracer (see the _Deploy note_ heading in `docs/ai-capabilities.md`).
- `AGENTS.md` + `docs/**` = INSTRUCTION loaded BY THE CODING AGENT from disk, on demand.
  Never routed through `loadSkill`/`serializeSkillResources`; the app does not read them.

## Layout & authority

- `app/layout.tsx` = TRUE ROOT: owns `<html>`/`<body>`, global metadata, the `globals.css`
  import, the pre-hydration splash node, and the `beforeInteractive` boot script. Resolves
  localized `lang` via `getLocale()`.
- `app/[locale]/layout.tsx` = SEGMENT: validates locale, `getMessages({ locale })`, mounts
  providers + chrome (Header/Footer/CookieBanner/GtmScript/SplashLoader). MUST NOT contain
  `<html>`/`<body>` nor import `globals.css`. Exposes `generateStaticParams`.
- `app/[locale]/page.tsx` + legal/sitemap pages = static Server Components (`params:{locale}`).
- `app/[locale]/[...rest]/page.tsx` = catch-all calling `notFound()`: unknown paths under a
  locale render `app/[locale]/not-found.tsx` INSIDE the segment layout. Without it Next renders
  its default 404 outside the layout (no providers, no SplashLoader) and the splash never
  leaves. `app/not-found.tsx` (root) only serves paths matching no locale: language-neutral,
  the splash is hidden by CSS (`body:has(.root-not-found)`), never removed.
- `app/[locale]/articles/**` = article listing + pages, fed by `content/articles/` (site
  content read through `lib/articles/source.ts`, NOT model-facing); see `docs/articles.md`.
- `app/api/run/route.ts` = the ONE unified AI entry; `app/api/hello/route.ts` = legacy
  adapter delegating to `run({ agentId:'hello' })` (see _HTTP_ in `docs/ai-capabilities.md`).
- `components/ui/` = neutral public API + generic SVG/CSS (no MUI). `components/ui/material/`
  = the ONLY MUI adapter (own `index.css`). `components/{layout,home,content}/` = composition.
- `tests/unit/` (Vitest) and `tests/e2e/` (Playwright) must not overlap: Vitest `include`
  excludes `tests/e2e/`; Playwright `testDir` is `tests/e2e`.

## Boot-script placement (a recurring trap)

The anti-FOUC / anti-banner-flash inline script MUST use `next/script` with
`strategy="beforeInteractive"` AND live in the TRUE ROOT `app/layout.tsx`. Next only hoists
`beforeInteractive` out of the hydratable tree at the root; in a segment layout (or under
Turbopack dev at the wrong level) the `<script>` stays in the React tree and throws
"Encountered a script tag while rendering React component". It reads localStorage then the
theme cookie, resolves `system` via matchMedia, sets `documentElement.dataset.theme`, adds
`has-consent` when the consent cookie exists, and sets `lang` from the pathname for every
SERVED locale (the list is serialized from `i18n/locales.ts` at build).

## Security headers

`next.config.ts` applies `buildSecurityHeaders` (pure `lib/security-headers.ts`, unit-tested) to
every route. Framing defaults to same origin (`X-Frame-Options: SAMEORIGIN` + CSP
`frame-ancestors 'self'`); `FRAME_ANCESTORS` (build-time, server-only) adds origins allowed to
embed the site (e.g. a portfolio showing it in an iframe), in which case `X-Frame-Options` is
dropped because it cannot express an allowlist. Invalid sources fail the build. Netlify deploy
previews have their own hosts: list them explicitly, never widen to `https://*.netlify.app`.

## Divergence note — do NOT "fix" per generic tutorials

A common Next/next-intl skeleton puts `i18n.ts`, `navigation.ts`, `proxy.ts` under `app/`.
In THIS repo they do NOT. Server message-loading config = `i18n/request.ts`; typed
navigation/routing = `i18n/routing.ts`; interception = `middleware.ts` AT THE ROOT (active,
because the Netlify adapter does not yet support the `proxy` convention — the deprecation
warning is expected and acceptable), with `proxy.ts.disabled` parked at the root. Do not
move these under `app/`, and do not delete `middleware.ts` to silence the warning.

## Middleware matcher (root `middleware.ts`)

The interception matcher must EXCLUDE technical and API routes (`api`, `_next`, `_vercel`,
`trpc`, and any path containing a dot), and must be ADAPTED if the app ever gains a dynamic
route or a route whose path contains a dot — a too-wide matcher intercepts `/api/*` and
breaks the AI handlers, a too-narrow one leaks unlocalized traffic. This is the live
`middleware.ts` (kept active for Netlify, see the divergence note above); the parked
`proxy.ts.disabled` carries the same matcher for the day the adapter supports `proxy`.

## Deriving a site (extension points)

A derived site (a repo that merges Axons tags from an `upstream` remote) must not edit Axons
files, or every upstream merge conflicts. It owns ONE folder, `site/`, and replaces its files:

| File                           | Holds                                                                                                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site/config.ts`               | `SITE` (`satisfies SiteConfig`): name, root title/description fallbacks, GitHub URL, brand accent, chrome switches, `articlesEnabled`, SEO resources + hero video, `pathnames`, `nav`, `collections`, `messageOverrides` |
| `content/<collection>/`        | a site's own Markdown collections (declared in `SITE.collections`; docs/articles.md → Collections)                                                                                                                       |
| `site/messages/<locale>.json`  | the site's own copy, one file per SUPPORTED locale (`{}` = nothing to add)                                                                                                                                               |
| `app/[locale]/<page>/page.tsx` | the site's own pages (new files: no conflict)                                                                                                                                                                            |

The contract (`SiteConfig`) and the merges are PURE code in `lib/site-extension.ts`
(100%-branch unit tests in `tests/unit/site-extension.test.ts`); Axons-owned files only consume
them, so a new `SiteConfig` field shows up in a derived site as a TYPE ERROR in `site/config.ts`
(explicit), never as a silent default or a merge conflict elsewhere.

- Identity/chrome: `constants/site.ts` keeps the logic (env, flags, `LOCALES`, ad sizes) and
  re-exports `SITE` under the historical names (`SITE_NAME`, `GITHUB_URL`, `BRAND_ACCENT_FROM`,
  `HEADER_NAV_ENABLED`, `GITHUB_LINK_ENABLED`, `ARTICLES_ENABLED`, `SEO_RESOURCES`,
  `HERO_VIDEO_ID`): import from `@/constants/site`, not from `@/site/config`.
- Routes: `SITE.pathnames` (same shape as next-intl `pathnames`, declared `as const`) is merged
  into `i18n/routing.ts` by `mergePathnames`; a key that redefines an Axons route THROWS at
  build. Typed `Link`/`getPathname`/`pageMetadata` accept the site keys. `sitemap.xml` lists
  every STATIC route (no `[param]`) of the merged map; a dynamic site route (a second Markdown
  collection) must add its own entries.
- Nav: `SITE.nav` entries `{ href, key: "nav.<id>", header? }` (`href` typed against
  `SITE.pathnames`) are inserted after Home in the footer and the HTML sitemap page, and in the
  header unless `header: false`. A disabled collection (`ARTICLES_ENABLED`, a site collection's `enabled`) drops its entry. Labels live in
  `site/messages/<locale>.json` under `nav`.
- Messages: `i18n/request.ts` deep-merges `site/messages/<locale>.json` INTO
  `messages/<locale>.json` (`mergeMessages`). New keys are added; a key present on both sides
  THROWS (build fails, path named) unless that path or a parent is listed in
  `SITE.messageOverrides` (e.g. `"meta.home"`, `"hero"`): replacing Axons copy is always an
  explicit, greppable choice. The legal `{placeholders}` are interpolated after the merge.

Axons ITSELF keeps `pathnames: {}`, `nav: []`, `collections: []`, `messageOverrides: []` and empty
`site/messages/*.json`, so its behavior is unchanged. Do not put Axons features in `site/`.
In the derived repo, mark the folder as "ours" so upstream edits to Axons' defaults never
conflict: `.gitattributes` → `site/** merge=ours`, plus `git config merge.ours.driver true`.
