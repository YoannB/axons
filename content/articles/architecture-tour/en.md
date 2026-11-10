---
title: "A five-minute tour of the Axons architecture"
slug: architecture-tour
date: 2026-11-03
description: "A neutral UI layer, translated URLs, a single door for AI and static pages by default: the few boundaries that hold Axons together."
---

Axons is a Next.js 16 boilerplate for search-friendly sites with a light AI layer. Its structure rests on a few strict boundaries.

## A neutral UI layer

Components import from `components/ui`, never from Material UI directly. MUI lives only in `components/ui/material/`, an adapter that ESLint keeps closed. Changing the design system means rewriting one folder, not the whole app.

## Translated URLs everywhere

Languages are declared once in `i18n/locales.ts`, and `NEXT_PUBLIC_LOCALES` picks the ones a site serves. Routing, the sitemap, `hreflang` and the language switcher all derive from that single list. Every visible string lives in `messages/<locale>.json`.

## One door for AI

Every model call goes through a single Route Handler, `/api/run`, backed by OpenRouter. Agents are Markdown files in `capabilities/agents/`. The API key stays on the server, a daily quota is enforced server-side, and without a key the whole AI layer disappears from the interface.

## Static by default

Public pages are prerendered at build time, articles included. Pure logic (parsers, quota rules, text diff) is covered at 100% of branches by Vitest, Playwright tests the user journeys, and Storybook documents every component state.

## Shipping

Every change lands through a pull request. CI runs type-checking, lint, formatting, unit tests, the production build, end-to-end tests and the Storybook build, then Netlify deploys `main`.
