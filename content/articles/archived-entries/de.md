---
title: "Alte Einträge als Archiv behalten"
slug: alte-eintraege-behalten
date: 2025-06-01
description: "Ein Archivbeispiel: wie eine Sammlung alte Einträge kennzeichnet, sie unverändert online lässt und nicht mehr als Neuigkeit zeigt."
archived: true
---

Dieser Eintrag ist ein Archivbeispiel. Sein Front Matter enthält `archived: true`, daher zeigen jede Karte, die ihn auflistet, und diese Seite ein **Archiv**-Badge, und die Seite fügt über dem Text einen kurzen Hinweis ein.

## Zwei Wege zum Archivieren

- Pro Eintrag: `archived: true` im Front Matter einer Übersetzung (`archived: false` nimmt einen einzelnen Eintrag von einer Regel aus).
- Pro Sammlung: `archiveBefore: "2018-01-01"` in der Site-Konfiguration archiviert alle Einträge vor diesem Tag.

## Was sich für Lesende ändert

Ein Archiv wird nie als **Neu** markiert, und der Block „Neueste“ der Startseite überspringt Archive: Er greift nur unter einem Archiv-Titel auf sie zurück, wenn eine Sammlung sonst nichts zu zeigen hat. Der Inhalt selbst bleibt genau so, wie er veröffentlicht wurde.
