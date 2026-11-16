---
title: "Conserver les anciennes entrées en archives"
slug: conserver-les-anciennes-entrees
date: 2025-06-01
description: "Un exemple d'archive : comment une collection signale ses anciennes entrées, les garde en ligne telles quelles et cesse de les présenter comme des nouveautés."
archived: true
---

Cette entrée est un exemple d'archive. Son entête porte `archived: true` : chaque carte qui la liste et cette page affichent un badge **Archive**, et la page ajoute une courte mention au-dessus du texte.

## Deux façons d'archiver

- Par entrée : `archived: true` dans l'entête d'une traduction (`archived: false` soustrait une seule entrée à une règle).
- Par collection : `archiveBefore: "2018-01-01"` dans la configuration du site archive toutes les entrées datées d'avant ce jour.

## Ce qui change pour le lecteur

Une archive n'est jamais marquée **Nouveau**, et le bloc « derniers » de l'accueil saute les archives : il ne se rabat sur elles, sous un titre « archives », que lorsqu'une collection n'a rien d'autre à montrer. Le contenu lui-même reste exactement tel qu'il a été publié.
