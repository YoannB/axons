---
title: "Writing an article in Axons"
slug: writing-an-article
date: 2026-11-10
description: "One folder per article, one Markdown file per language: how the article pipeline works, from the front matter to the sitemap."
image: /articles/writing-articles/cover.svg
---

Axons publishes articles straight from the repository: no CMS, no database. An article is a folder under `content/articles/`, and each language is a Markdown file named after its locale.

## The layout

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

The folder name is the article's stable identifier. It never appears in a URL, so it never needs translating.

## The front matter

Every file opens with a YAML header:

```yaml
---
title: "Writing an article in Axons"
slug: writing-an-article
date: 2026-11-10
description: "One sentence for listings, search results and social cards."
image: /articles/writing-articles/cover.svg
---
```

| Field         | Role                                                    |
| ------------- | ------------------------------------------------------- |
| `title`       | Page heading and `<title>`                              |
| `slug`        | Last URL segment, translated per language               |
| `date`        | Publication day (`YYYY-MM-DD`), for sorting and sitemap |
| `description` | Meta description and listing summary                    |
| `image`       | Optional cover, served from `public/`                   |

An invalid header (missing field, bad date, duplicated slug) fails the build and names the file: a broken article never reaches production silently.

## What you get for free

- a prerendered page per language, with a translated URL;
- `hreflang` links between translations and a canonical URL per language;
- an entry in `sitemap.xml` and schema.org `BlogPosting` data;
- a place in the listing and in the "latest articles" block of the home page.

If a language has no translation yet, the listing shows the article in another language with a badge, and links to its original URL. No duplicate page is created.

## Publishing

Add the files in a pull request. Once CI is green and the branch is merged, Netlify rebuilds the site and the article is online a few minutes later.
