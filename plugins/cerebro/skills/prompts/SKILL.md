---
name: prompts
description: Usa esta skill cuando redactes, optimices o guardes prompts para modelos de texto, generación de imágenes o creación de video, y cuando consultes la biblioteca de plantillas (prompt engineering, system prompt, few-shot, text-to-image, text-to-video).
---

# Ingeniería de prompts y biblioteca de prompts

## Propósito

Esta skill reúne los criterios de ingeniería de prompts y la biblioteca de plantillas aprobadas por el usuario. Sirve como punto de entrada para redactar instrucciones precisas para modelos de texto, imagen y video, además de consultar prompts reutilizables en `biblioteca/`.

## Cómo trabajar con esta skill

1. Identificar qué subtemas toca la tarea.
2. Leer solo los archivos de `criterios/` correspondientes a esos subtemas.
3. Aplicar los criterios encontrados y citar el archivo usado.
4. Seguir la sub-skill correspondiente cuando exista una que cubra la tarea completa.
5. Cuando la tarea aborde un aspecto nuevo que falte en los criterios, trabajar con buen criterio profesional y anotarlo al final como "posible criterio nuevo" para que el usuario decida si se guarda.

## Mapa de criterios

| Archivo | Qué cubre |
| --- | --- |
| `criterios/estructura-prompts.md` | Anatomía del prompt, roles, contexto, restricciones y formatos de salida. |
| `criterios/prompts-texto.md` | Técnicas para redacción, análisis, código y razonamiento con modelos de lenguaje. |
| `criterios/prompts-imagen.md` | Descriptores visuales, estilo, iluminación, cámara y parámetros para imagen. |
| `criterios/prompts-video.md` | Descripción de movimiento, planos, ritmo y continuidad para video con IA. |

## Sub-skills

Aquí se listan los procedimientos completos de este dominio a medida que se aprueben.

- (ninguna todavía)

## Reglas de mantenimiento

- Cada criterio guarda su fuente (enlace y fecha) en `fuentes.md`.
- Cuando un subtema acumula cinco o más criterios relacionados, se propone ascenderlo a sub-skill.
- Cuando un contenido nuevo contradice un criterio existente, se pregunta al usuario cuál prevalece.
- Los cambios entran como propuesta y se instalan tras la aprobación del usuario.
