---
title: "Conservar las entradas antiguas como archivo"
slug: conservar-entradas-antiguas
date: 2025-06-01
description: "Un ejemplo de archivo: cómo una colección señala sus entradas antiguas, las mantiene en línea tal cual y deja de presentarlas como novedades."
archived: true
---

Esta entrada es un ejemplo de archivo. Su cabecera lleva `archived: true`, así que cada tarjeta que la muestra y esta página llevan una insignia **Archivo**, y la página añade una breve nota encima del texto.

## Dos formas de archivar

- Por entrada: `archived: true` en la cabecera de una traducción (`archived: false` excluye una sola entrada de una regla).
- Por colección: `archiveBefore: "2018-01-01"` en la configuración del sitio archiva todas las entradas anteriores a ese día.

## Qué cambia para el lector

Un archivo nunca se marca como **Nuevo**, y el bloque «últimos» de la portada omite los archivos: solo recurre a ellos, con un título de archivo, cuando una colección no tiene nada más que mostrar. El contenido se mantiene exactamente como se publicó.
