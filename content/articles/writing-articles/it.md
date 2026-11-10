---
title: "Scrivere un articolo in Axons"
slug: scrivere-un-articolo
date: 2026-11-10
description: "Una cartella per articolo, un file Markdown per lingua: come funzionano gli articoli, dall'intestazione YAML alla sitemap."
image: /articles/writing-articles/cover.svg
---

Axons pubblica gli articoli direttamente dal repository: niente CMS, niente database. Un articolo è una cartella in `content/articles/`, e ogni lingua è un file Markdown che porta il nome della sua locale.

## La struttura

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

Il nome della cartella è l'identificativo stabile dell'articolo. Non compare mai in un URL, quindi non va mai tradotto.

## L'intestazione YAML

Ogni file inizia con un'intestazione YAML:

```yaml
---
title: "Scrivere un articolo in Axons"
slug: scrivere-un-articolo
date: 2026-11-10
description: "Una frase per gli elenchi, i risultati di ricerca e i social."
image: /articles/writing-articles/cover.svg
---
```

| Campo         | Ruolo                                                             |
| ------------- | ----------------------------------------------------------------- |
| `title`       | Titolo della pagina e tag `<title>`                               |
| `slug`        | Ultimo segmento dell'URL, tradotto in ogni lingua                 |
| `date`        | Giorno di pubblicazione (`AAAA-MM-GG`), per l'ordine e la sitemap |
| `description` | Meta description e riassunto nell'elenco                          |
| `image`       | Copertina facoltativa, servita da `public/`                       |

Un'intestazione non valida (campo mancante, data errata, slug duplicato) fa fallire la build indicando il file: un articolo difettoso non arriva mai in produzione in silenzio.

## Cosa ottieni senza fare nulla

- una pagina pregenerata per lingua, con un URL tradotto;
- link `hreflang` tra le traduzioni e un URL canonico per lingua;
- una voce in `sitemap.xml` e dati schema.org `BlogPosting`;
- un posto nell'elenco e nel blocco «ultimi articoli» della home.

Se una lingua non ha ancora una traduzione, l'elenco mostra l'articolo in un'altra lingua, con un badge, e rimanda al suo URL originale. Non viene creata nessuna pagina duplicata.

## Pubblicare

Aggiungi i file in una pull request. Quando la CI è verde e il branch è stato unito, Netlify ricostruisce il sito e l'articolo è online pochi minuti dopo.
