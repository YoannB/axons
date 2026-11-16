---
title: "Manter entradas antigas como arquivo"
slug: manter-entradas-antigas
date: 2025-06-01
description: "Um exemplo de arquivo: como uma coleção assinala as entradas antigas, as mantém online tal como estavam e deixa de as apresentar como novidades."
archived: true
---

Esta entrada é um exemplo de arquivo. O seu front matter tem `archived: true`, por isso cada cartão que a lista e esta página mostram um selo **Arquivo**, e a página acrescenta uma nota curta acima do texto.

## Duas formas de arquivar

- Por entrada: `archived: true` no front matter de uma tradução (`archived: false` retira uma única entrada de uma regra).
- Por coleção: `archiveBefore: "2018-01-01"` na configuração do site arquiva todas as entradas anteriores a esse dia.

## O que muda para quem lê

Um arquivo nunca é marcado como **Novo**, e o bloco «últimos» da página inicial ignora os arquivos: só recorre a eles, com um título de arquivo, quando uma coleção não tem mais nada para mostrar. O conteúdo mantém-se exatamente como foi publicado.
