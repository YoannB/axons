---
title: "Escrever um artigo no Axons"
slug: escrever-um-artigo
date: 2026-11-10
description: "Uma pasta por artigo, um ficheiro Markdown por idioma: como funcionam os artigos, do cabeçalho YAML ao sitemap."
image: /articles/writing-articles/cover.svg
---

O Axons publica os artigos diretamente a partir do repositório: sem CMS nem base de dados. Um artigo é uma pasta em `content/articles/`, e cada idioma é um ficheiro Markdown com o nome da sua locale.

## A estrutura

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

O nome da pasta é o identificador estável do artigo. Nunca aparece num URL, por isso nunca precisa de ser traduzido.

## O cabeçalho YAML

Cada ficheiro começa com um cabeçalho YAML:

```yaml
---
title: "Escrever um artigo no Axons"
slug: escrever-um-artigo
date: 2026-11-10
description: "Uma frase para as listas, os resultados de pesquisa e as redes sociais."
image: /articles/writing-articles/cover.svg
---
```

| Campo         | Função                                                         |
| ------------- | -------------------------------------------------------------- |
| `title`       | Título da página e etiqueta `<title>`                          |
| `slug`        | Último segmento do URL, traduzido em cada idioma               |
| `date`        | Dia de publicação (`AAAA-MM-DD`), para a ordenação e o sitemap |
| `description` | Meta description e resumo na lista                             |
| `image`       | Capa opcional, servida a partir de `public/`                   |

Um cabeçalho inválido (campo em falta, data errada, slug duplicado) faz falhar o build indicando o ficheiro: um artigo com erros nunca chega à produção em silêncio.

## O que obtém sem esforço

- uma página pré-gerada por idioma, com um URL traduzido;
- ligações `hreflang` entre as traduções e um URL canónico por idioma;
- uma entrada em `sitemap.xml` e dados schema.org `BlogPosting`;
- um lugar na lista e no bloco «últimos artigos» da página inicial.

Se um idioma ainda não tiver tradução, a lista mostra o artigo noutro idioma, com um selo, e aponta para o seu URL original. Não é criada nenhuma página duplicada.

## Publicar

Adicione os ficheiros num pull request. Quando a CI estiver verde e o branch tiver sido integrado, o Netlify reconstrói o site e o artigo fica online poucos minutos depois.
