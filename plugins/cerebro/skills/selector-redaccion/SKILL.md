---
name: selector-redaccion
description: Úsala cuando Angel escriba o revise un texto para publicar o enviar (copy de una pieza, anuncio, post, guion, correo, landing, botones, bio, newsletter). Muestra la galería, pregunta si usar edit-copy, humanizer, las dos o ninguna, y aplica lo que Angel elija.
---

# Selector de redacción

Angel decide qué skill pule cada texto. Esta skill le muestra lo que hace cada una y aplica su elección. Las dos skills viven en el plugin de skills portables de Angel y se activan solo cuando Angel las elige.

## Cuándo se activa

- Angel pide escribir, redactar, mejorar o revisar un texto: copy de una pieza gráfica, anuncio, post, caption, guion, correo, landing, botones, microcopy, bio, eslogan, newsletter o artículo.
- El hook `hooks/sugerir-redaccion.sh` del plugin detecta esos pedidos, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer pedido de la sesión; en los siguientes, abrirla si Angel la pide.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), una sola vez por texto, preguntar cuál usar. Opciones: Solo edit-copy, Solo humanizer, Las dos, Ninguna. Recomendar una según la tabla de abajo.
3. **Aplicar.** Seguir el `SKILL.md` de la skill elegida. Angel también puede escribir `/edit-copy` o `/humanizer`. Si la herramienta de skills la rechaza, leer el archivo directamente:
   ```bash
   find ~/.claude/plugins -path '*skills/edit-copy/SKILL.md' -o -path '*skills/humanizer/SKILL.md' 2>/dev/null
   ```
   Con «Las dos», primero edit-copy y después humanizer sobre el resultado.
4. **Entrega.** Mostrar el texto final y, debajo, la lista corta de cambios de cada skill.
5. **Memoria del hilo.** Si Angel ya eligió para ese mismo texto o esa misma pieza, aplicar su elección en las versiones siguientes sin volver a preguntar.

## Qué recomendar

| Texto | Recomendación | Por qué |
| --- | --- | --- |
| Landing, botones, interfaz, documentación de producto, app en varios idiomas | Solo edit-copy | Pide datos concretos, marca afirmaciones sin prueba y cuida términos y traducciones |
| Post, guion, correo, artículo con datos ya claros | Solo humanizer | Quita las señales de texto hecho con IA y deja el ritmo de una persona |
| Anuncio, pieza gráfica con copy, lanzamiento | Las dos | El anuncio necesita afirmaciones comprobables y un tono natural |
| Mensaje rápido, nota interna, texto que Angel ya escribió a su gusto | Ninguna | Claude redacta con las reglas de redacción del proyecto |

## Cuidado en español

- humanizer trae ejemplos en inglés: aplica igual los contrastes «no es X, sino Y», los remates y las entradas preparadas; las palabras comodín se revisan a mano.
- Las comillas latinas («») se conservan.
- edit-copy declara inglés, coreano y japonés; en español se usan sus preguntas de precisión y prueba, y la naturalidad la juzga Claude.

## Relación con el cerebro

- Los criterios de microcopy de `ux-ui/criterios/microcopy.md` siguen aplicando a los textos de interfaz.
- Fichas: `repos/blader-humanizer.md`.

## Fuente

[Lámina de Instagram](https://www.instagram.com/p/DfrsUrYiPFW/) guardada el 2026-11-25, con diez repos para Claude; de ahí salió humanizer.
