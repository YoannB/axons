---
title: "Einen Artikel in Axons schreiben"
slug: einen-artikel-schreiben
date: 2026-11-10
description: "Ein Ordner pro Artikel, eine Markdown-Datei pro Sprache: So funktionieren die Artikel, vom YAML-Header bis zur Sitemap."
image: /articles/writing-articles/cover.svg
---

Axons veröffentlicht Artikel direkt aus dem Repository: kein CMS, keine Datenbank. Ein Artikel ist ein Ordner unter `content/articles/`, und jede Sprache ist eine Markdown-Datei, die nach ihrer Locale benannt ist.

## Die Struktur

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

Der Ordnername ist die stabile Kennung des Artikels. Er erscheint nie in einer URL und muss daher nie übersetzt werden.

## Der YAML-Header

Jede Datei beginnt mit einem YAML-Header:

```yaml
---
title: "Einen Artikel in Axons schreiben"
slug: einen-artikel-schreiben
date: 2026-11-10
description: "Ein Satz für Listen, Suchergebnisse und soziale Netzwerke."
image: /articles/writing-articles/cover.svg
---
```

| Feld          | Rolle                                                           |
| ------------- | --------------------------------------------------------------- |
| `title`       | Seitenüberschrift und `<title>`                                 |
| `slug`        | Letztes URL-Segment, in jeder Sprache übersetzt                 |
| `date`        | Veröffentlichungstag (`JJJJ-MM-TT`), für Sortierung und Sitemap |
| `description` | Meta-Description und Zusammenfassung in der Liste               |
| `image`       | Optionales Titelbild, aus `public/` ausgeliefert                |

Ein ungültiger Header (fehlendes Feld, falsches Datum, doppelter Slug) lässt den Build mit dem Dateinamen fehlschlagen: Ein defekter Artikel gelangt nie unbemerkt in die Produktion.

## Was Sie ohne Aufwand bekommen

- eine vorgerenderte Seite pro Sprache, mit übersetzter URL;
- `hreflang`-Links zwischen den Übersetzungen und eine kanonische URL pro Sprache;
- einen Eintrag in `sitemap.xml` und schema.org-Daten vom Typ `BlogPosting`;
- einen Platz in der Liste und im Block „Neueste Artikel“ der Startseite.

Fehlt einer Sprache noch die Übersetzung, zeigt die Liste den Artikel in einer anderen Sprache mit einem Hinweis an und verlinkt auf seine Original-URL. Es entsteht keine doppelte Seite.

## Veröffentlichen

Fügen Sie die Dateien in einem Pull Request hinzu. Sobald die CI grün ist und der Branch gemergt wurde, baut Netlify die Website neu, und der Artikel ist wenige Minuten später online.
