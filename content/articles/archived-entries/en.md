---
title: "Keeping old entries as archives"
slug: keeping-old-entries
date: 2025-06-01
description: "An example archive: how a collection marks old entries, keeps them online as they were and stops presenting them as news."
archived: true
---

This entry is an example archive. Its front matter carries `archived: true`, so every card that lists it and this page show an **Archive** badge, and the page adds a short notice above the text.

## Two ways to archive

- Per entry: `archived: true` in the front matter of a translation (`archived: false` keeps a single entry out of a rule).
- Per collection: `archiveBefore: "2018-01-01"` in the site configuration archives every entry dated before that day.

## What changes for the reader

An archive is never marked **New**, and the home page's "latest" block skips archives: it only falls back to them, under an "archives" title, when a collection has nothing else to show. The content itself stays exactly as it was published.
