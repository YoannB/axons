---
title: "L'architettura di Axons in cinque minuti"
slug: tour-dell-architettura
date: 2026-11-03
description: "Uno strato di interfaccia neutro, URL tradotti, un'unica porta per l'IA e pagine statiche per impostazione predefinita: i pochi confini che tengono insieme Axons."
---

Axons è un boilerplate Next.js 16 per siti pensati per la SEO, con uno strato di IA leggero. La sua struttura poggia su pochi confini rigorosi.

## Uno strato di interfaccia neutro

I componenti importano da `components/ui`, mai direttamente da Material UI. MUI vive solo in `components/ui/material/`, un adattatore che ESLint tiene chiuso. Cambiare design system significa riscrivere una cartella, non l'intera applicazione.

## URL tradotti ovunque

Le lingue sono dichiarate una sola volta in `i18n/locales.ts`, e `NEXT_PUBLIC_LOCALES` sceglie quelle servite da un sito. Il routing, la sitemap, gli `hreflang` e il selettore di lingua derivano tutti da quell'unico elenco. Ogni testo visibile vive in `messages/<locale>.json`.

## Un'unica porta per l'IA

Ogni chiamata a un modello passa da un unico Route Handler, `/api/run`, basato su OpenRouter. Gli agenti sono file Markdown in `capabilities/agents/`. La chiave API resta sul server, una quota giornaliera è applicata lato server e, senza chiave, l'intero strato di IA scompare dall'interfaccia.

## Statico per impostazione predefinita

Le pagine pubbliche sono pregenerate durante la build, articoli compresi. La logica pura (parser, regole di quota, diff del testo) è coperta al 100% dei rami da Vitest, Playwright testa i percorsi utente e Storybook documenta ogni stato dei componenti.

## Rilasciare

Ogni modifica arriva tramite una pull request. La CI esegue controllo dei tipi, lint, formattazione, test unitari, build di produzione, test end-to-end e build di Storybook, poi Netlify pubblica `main`.
