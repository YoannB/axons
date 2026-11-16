---
title: "Conservare le vecchie voci come archivio"
slug: conservare-le-vecchie-voci
date: 2025-06-01
description: "Un esempio di archivio: come una raccolta segnala le voci vecchie, le mantiene online così com'erano e smette di presentarle come novità."
archived: true
---

Questa voce è un esempio di archivio. Il suo front matter contiene `archived: true`, quindi ogni scheda che la elenca e questa pagina mostrano un badge **Archivio**, e la pagina aggiunge una breve nota sopra il testo.

## Due modi per archiviare

- Per voce: `archived: true` nel front matter di una traduzione (`archived: false` esclude una singola voce da una regola).
- Per raccolta: `archiveBefore: "2018-01-01"` nella configurazione del sito archivia tutte le voci datate prima di quel giorno.

## Cosa cambia per chi legge

Un archivio non è mai segnato come **Nuovo**, e il blocco «ultimi» della home salta gli archivi: ripiega su di essi, con un titolo d'archivio, solo quando una raccolta non ha altro da mostrare. Il contenuto resta esattamente come è stato pubblicato.
