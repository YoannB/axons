---
title: "A arquitetura do Axons em cinco minutos"
slug: tour-pela-arquitetura
date: 2026-11-03
description: "Uma camada de interface neutra, URLs traduzidos, uma única porta para a IA e páginas estáticas por omissão: as poucas fronteiras que sustentam o Axons."
---

O Axons é um boilerplate Next.js 16 para sites pensados para o SEO, com uma camada de IA leve. A sua estrutura assenta em poucas fronteiras rigorosas.

## Uma camada de interface neutra

Os componentes importam de `components/ui`, nunca diretamente do Material UI. O MUI vive apenas em `components/ui/material/`, um adaptador que o ESLint mantém fechado. Mudar de design system significa reescrever uma pasta, não a aplicação inteira.

## URLs traduzidos em todo o lado

Os idiomas são declarados uma única vez em `i18n/locales.ts`, e `NEXT_PUBLIC_LOCALES` escolhe os que um site serve. O encaminhamento, o sitemap, os `hreflang` e o seletor de idioma derivam todos dessa lista única. Cada texto visível vive em `messages/<locale>.json`.

## Uma única porta para a IA

Cada chamada a um modelo passa por um único Route Handler, `/api/run`, apoiado no OpenRouter. Os agentes são ficheiros Markdown em `capabilities/agents/`. A chave da API fica no servidor, uma quota diária é aplicada do lado do servidor e, sem chave, toda a camada de IA desaparece da interface.

## Estático por omissão

As páginas públicas são pré-geradas no build, artigos incluídos. A lógica pura (analisadores, regras de quota, diff de texto) está coberta a 100% dos ramos pelo Vitest, o Playwright testa os percursos e o Storybook documenta cada estado dos componentes.

## Entregar

Cada alteração chega através de um pull request. A CI executa a verificação de tipos, o lint, a formatação, os testes unitários, o build de produção, os testes de ponta a ponta e o build do Storybook, e depois o Netlify publica `main`.
