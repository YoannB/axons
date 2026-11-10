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
