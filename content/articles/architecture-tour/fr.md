---
title: "L'architecture d'Axons en cinq minutes"
slug: visite-de-l-architecture
date: 2026-11-03
description: "Une couche d'interface neutre, des URL traduites, une seule porte pour l'IA et des pages statiques par défaut : les quelques frontières qui structurent Axons."
---

Axons est un boilerplate Next.js 16 pour des sites pensés pour le référencement, avec une couche d'IA légère. Sa structure repose sur quelques frontières strictes.

## Une couche d'interface neutre

Les composants importent depuis `components/ui`, jamais directement depuis Material UI. MUI ne vit que dans `components/ui/material/`, un adaptateur qu'ESLint garde fermé. Changer de design system revient à réécrire un dossier, pas toute l'application.

## Des URL traduites partout

Les langues sont déclarées une seule fois dans `i18n/locales.ts`, et `NEXT_PUBLIC_LOCALES` choisit celles qu'un site sert. Le routage, le sitemap, les `hreflang` et le sélecteur de langue découlent tous de cette liste unique. Chaque texte visible vit dans `messages/<locale>.json`.

## Une seule porte pour l'IA

Tout appel à un modèle passe par un unique Route Handler, `/api/run`, adossé à OpenRouter. Les agents sont des fichiers Markdown dans `capabilities/agents/`. La clé d'API reste sur le serveur, un quota quotidien est appliqué côté serveur, et sans clé toute la couche d'IA disparaît de l'interface.

## Statique par défaut

Les pages publiques sont prégénérées au build, articles compris. La logique pure (analyseurs, règles de quota, diff de texte) est couverte à 100 % des branches par Vitest, Playwright teste les parcours et Storybook documente chaque état des composants.

## Livrer

Chaque changement passe par une pull request. La CI enchaîne vérification des types, lint, formatage, tests unitaires, build de production, tests de bout en bout et build Storybook, puis Netlify déploie `main`.
