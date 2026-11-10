---
title: "Die Architektur von Axons in fünf Minuten"
slug: rundgang-durch-die-architektur
date: 2026-11-03
description: "Eine neutrale UI-Schicht, übersetzte URLs, ein einziger Zugang zur KI und standardmäßig statische Seiten: die wenigen Grenzen, die Axons zusammenhalten."
---

Axons ist ein Next.js-16-Boilerplate für suchmaschinenfreundliche Websites mit einer leichten KI-Schicht. Seine Struktur beruht auf einigen wenigen strikten Grenzen.

## Eine neutrale UI-Schicht

Komponenten importieren aus `components/ui`, nie direkt aus Material UI. MUI lebt nur in `components/ui/material/`, einem Adapter, den ESLint geschlossen hält. Ein Wechsel des Designsystems bedeutet, einen Ordner neu zu schreiben, nicht die ganze Anwendung.

## Übersetzte URLs überall

Die Sprachen werden einmal in `i18n/locales.ts` deklariert, und `NEXT_PUBLIC_LOCALES` wählt die aus, die eine Website ausliefert. Routing, Sitemap, `hreflang` und Sprachumschalter leiten sich alle von dieser einen Liste ab. Jeder sichtbare Text steht in `messages/<locale>.json`.

## Ein einziger Zugang zur KI

Jeder Modellaufruf läuft über einen einzigen Route Handler, `/api/run`, der auf OpenRouter aufsetzt. Agenten sind Markdown-Dateien in `capabilities/agents/`. Der API-Schlüssel bleibt auf dem Server, ein Tageskontingent wird serverseitig durchgesetzt, und ohne Schlüssel verschwindet die gesamte KI-Schicht aus der Oberfläche.

## Standardmäßig statisch

Öffentliche Seiten werden beim Build vorgerendert, Artikel eingeschlossen. Reine Logik (Parser, Kontingentregeln, Text-Diff) ist von Vitest zu 100 % der Verzweigungen abgedeckt, Playwright testet die Nutzerwege, und Storybook dokumentiert jeden Komponentenzustand.

## Ausliefern

Jede Änderung kommt über einen Pull Request. Die CI führt Typprüfung, Lint, Formatierung, Unit-Tests, Produktions-Build, End-to-End-Tests und Storybook-Build aus, danach deployt Netlify `main`.
