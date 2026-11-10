---
title: "Escribir un artículo en Axons"
slug: escribir-un-articulo
date: 2026-11-10
description: "Una carpeta por artículo, un archivo Markdown por idioma: cómo funcionan los artículos, desde la cabecera YAML hasta el sitemap."
image: /articles/writing-articles/cover.svg
---

Axons publica los artículos directamente desde el repositorio: sin CMS ni base de datos. Un artículo es una carpeta dentro de `content/articles/`, y cada idioma es un archivo Markdown con el nombre de su locale.

## La estructura

```text
content/articles/
  writing-articles/
    en.md
    fr.md
    es.md
```

El nombre de la carpeta es el identificador estable del artículo. Nunca aparece en una URL, así que nunca hay que traducirlo.

## La cabecera YAML

Cada archivo empieza con una cabecera YAML:

```yaml
---
title: "Escribir un artículo en Axons"
slug: escribir-un-articulo
date: 2026-11-10
description: "Una frase para los listados, los resultados de búsqueda y las redes sociales."
image: /articles/writing-articles/cover.svg
---
```

| Campo         | Función                                                       |
| ------------- | ------------------------------------------------------------- |
| `title`       | Título de la página y etiqueta `<title>`                      |
| `slug`        | Último segmento de la URL, traducido en cada idioma           |
| `date`        | Día de publicación (`AAAA-MM-DD`), para el orden y el sitemap |
| `description` | Meta description y resumen en el listado                      |
| `image`       | Portada opcional, servida desde `public/`                     |

Una cabecera no válida (campo ausente, fecha incorrecta, slug duplicado) hace fallar el build indicando el archivo: un artículo roto nunca llega a producción en silencio.

## Lo que obtienes sin hacer nada

- una página pregenerada por idioma, con una URL traducida;
- enlaces `hreflang` entre traducciones y una URL canónica por idioma;
- una entrada en `sitemap.xml` y datos schema.org `BlogPosting`;
- un lugar en el listado y en el bloque «últimos artículos» de la portada.

Si un idioma aún no tiene traducción, el listado muestra el artículo en otro idioma, con una insignia, y enlaza a su URL original. No se crea ninguna página duplicada.

## Publicar

Añade los archivos en una pull request. Cuando la CI está en verde y la rama se fusiona, Netlify reconstruye el sitio y el artículo está en línea unos minutos después.
