---
name: selector-herramientas-ia
description: Úsala cuando Angel construya algo que genere PDF, extraiga datos de documentos, procese lotes de textos con IA o agregue un chat con IA a una app. Muestra la galería con lo que produce cada herramienta, pregunta cuál usar y la instala con su aprobación.
---

# Selector de herramientas para apps con IA

Angel elige la herramienta mirando lo que produce. Esta skill abre una galería con cuatro herramientas de código abierto, le pregunta cuál quiere y la instala en el proyecto siguiendo su ficha.

## Cuándo se activa

- Angel pide generar PDF en serie (facturas, certificados, informes), extraer campos de documentos, analizar muchos textos con un modelo o poner un chat con IA en una app.
- El hook `hooks/sugerir-herramientas-ia.sh` del plugin detecta esos temas en el mensaje, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer mensaje de la sesión; en los siguientes, abrirla si Angel la pide.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), preguntar qué herramienta usar. Recomendar una según la tabla de abajo y ofrecer «Hacerlo con código propio».
3. **Instalación.** Leer la ficha de la herramienta elegida en `repos/` del repositorio cerebro-skills, explicar a Angel qué instala y qué riesgos tiene, y seguir su «Instalación propuesta» tras su aprobación.
4. **Prueba.** Hacer un primer resultado pequeño (un PDF, una extracción, una tubería con cinco documentos, un chat de prueba) y mostrarlo antes de seguir.
5. **Aprendizaje.** Si Angel cuenta por qué eligió o descartó una herramienta, ofrecer guardarlo como criterio en la skill madre correspondiente y actualizar la «Decisión» de la ficha.

## Las cuatro herramientas

| Herramienta | Qué produce | Ideal para | Ficha |
| --- | --- | --- | --- |
| pdfme | PDF con diseño fijo a partir de una plantilla JSON y datos | Facturas, certificados, cotizaciones e informes en serie | `repos/pdfme-pdfme.md` |
| Unstract | JSON con los campos pedidos de cada documento, publicado como API | Sacar siempre los mismos datos de facturas, contratos o formularios | `repos/zipstack-unstract.md` |
| DocETL | Tablas con categorías, temas o resúmenes de cientos de documentos | Analizar en lote transcripciones, comentarios o guardados | `repos/ucbepic-docetl.md` |
| assistant-ui | Chat con IA en React con streaming, adjuntos y tarjetas de herramientas | Poner un asistente dentro de una app propia | `repos/assistant-ui-assistant-ui.md` |

Unstract y DocETL se diferencian por la forma del resultado: Unstract devuelve los mismos campos de cada documento; DocETL agrega y resume muchos documentos juntos.

## Fuente

[Carrusel de Instagram](https://www.instagram.com/p/Df90pdYE1M2/) guardado el 2026-11-25. Los otros cinco repositorios del carrusel esperan en `buzon/2026-11-25-repos-github-proyectos-ia.md`.
