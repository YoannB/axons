---
title: "La arquitectura de Axons en cinco minutos"
slug: recorrido-por-la-arquitectura
date: 2026-11-03
description: "Una capa de interfaz neutra, URL traducidas, una sola puerta para la IA y páginas estáticas por defecto: las pocas fronteras que sostienen Axons."
---

Axons es un boilerplate de Next.js 16 para sitios pensados para el posicionamiento, con una capa de IA ligera. Su estructura se apoya en unas pocas fronteras estrictas.

## Una capa de interfaz neutra

Los componentes importan desde `components/ui`, nunca directamente desde Material UI. MUI solo vive en `components/ui/material/`, un adaptador que ESLint mantiene cerrado. Cambiar de sistema de diseño significa reescribir una carpeta, no toda la aplicación.

## URL traducidas en todas partes

Los idiomas se declaran una sola vez en `i18n/locales.ts`, y `NEXT_PUBLIC_LOCALES` elige los que sirve cada sitio. El enrutamiento, el sitemap, los `hreflang` y el selector de idioma derivan todos de esa lista única. Cada texto visible vive en `messages/<locale>.json`.

## Una sola puerta para la IA

Toda llamada a un modelo pasa por un único Route Handler, `/api/run`, respaldado por OpenRouter. Los agentes son archivos Markdown en `capabilities/agents/`. La clave de la API se queda en el servidor, se aplica una cuota diaria en el servidor y, sin clave, toda la capa de IA desaparece de la interfaz.

## Estático por defecto

Las páginas públicas se pregeneran en el build, artículos incluidos. La lógica pura (analizadores, reglas de cuota, diff de texto) está cubierta al 100 % de las ramas por Vitest, Playwright prueba los recorridos y Storybook documenta cada estado de los componentes.

## Entregar

Cada cambio llega mediante una pull request. La CI ejecuta la comprobación de tipos, el lint, el formato, las pruebas unitarias, el build de producción, las pruebas de extremo a extremo y el build de Storybook, y después Netlify despliega `main`.
