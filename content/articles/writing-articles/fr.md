---
title: "Écrire un article dans Axons"
slug: ecrire-un-article
date: 2026-11-10
description: "Un dossier par article, un fichier Markdown par langue : le fonctionnement des articles, de l'entête YAML au sitemap."
image: /articles/writing-articles/cover.svg
---

Axons publie ses articles directement depuis le dépôt : ni CMS, ni base de données. Un article est un dossier sous `content/articles/`, et chaque langue est un fichier Markdown nommé d'après sa locale.

## Le rangement

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

Le nom du dossier est l'identifiant stable de l'article. Il n'apparaît jamais dans une URL, il n'a donc jamais besoin d'être traduit.

## L'entête YAML

Chaque fichier commence par une entête YAML :

```yaml
---
title: "Écrire un article dans Axons"
slug: ecrire-un-article
date: 2026-11-10
description: "Une phrase pour les listes, les résultats de recherche et les partages."
image: /articles/writing-articles/cover.svg
---
```

| Champ         | Rôle                                                          |
| ------------- | ------------------------------------------------------------- |
| `title`       | Titre de la page et balise `<title>`                          |
| `slug`        | Dernier segment de l'URL, traduit dans chaque langue          |
| `date`        | Jour de publication (`AAAA-MM-JJ`), pour le tri et le sitemap |
| `description` | Meta description et résumé dans la liste                      |
| `image`       | Couverture facultative, servie depuis `public/`               |

Une entête invalide (champ manquant, date erronée, slug en double) fait échouer le build en nommant le fichier : un article cassé n'arrive jamais en production sans bruit.

## Ce que vous obtenez sans rien faire

- une page prégénérée par langue, avec une URL traduite ;
- des liens `hreflang` entre les traductions et une URL canonique par langue ;
- une entrée dans `sitemap.xml` et des données schema.org `BlogPosting` ;
- une place dans la liste et dans le bloc « derniers articles » de l'accueil.

Si une langue n'a pas encore de traduction, la liste affiche l'article dans une autre langue, avec un badge, et pointe vers son URL d'origine. Aucune page en double n'est créée.

## Publier

Ajoutez les fichiers dans une pull request. Une fois la CI verte et la branche mergée, Netlify reconstruit le site et l'article est en ligne quelques minutes plus tard.
