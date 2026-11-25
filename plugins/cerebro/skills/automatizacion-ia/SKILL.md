---
name: automatizacion-ia
description: Usa esta skill cuando diseñes flujos automatizados, construyas agentes de IA, conectes servidores MCP, configures herramientas no-code o integres APIs y modelos de lenguaje (AI agents, workflow automation, MCP, no-code, LLM API).
---

# Automatización y agentes con IA

## Propósito

Esta skill reúne los criterios sobre automatización y agentes con inteligencia artificial guardados por el usuario. Sirve como punto de entrada para diseñar flujos robustos, conectar herramientas mediante MCP, elegir plataformas no-code e integrar APIs de modelos.

## Cómo trabajar con esta skill

1. Identificar qué subtemas toca la tarea.
2. Leer solo los archivos de `criterios/` correspondientes a esos subtemas.
3. Aplicar los criterios encontrados y citar el archivo usado.
4. Seguir la sub-skill correspondiente cuando exista una que cubra la tarea completa.
5. Cuando la tarea aborde un aspecto nuevo que falte en los criterios, trabajar con buen criterio profesional y anotarlo al final como "posible criterio nuevo" para que el usuario decida si se guarda.

## Mapa de criterios

| Archivo | Qué cubre |
| --- | --- |
| `criterios/flujos-agentes.md` | Arquitectura de agentes, delegación, memoria y control de flujos. |
| `criterios/integraciones-mcp.md` | Conexión de herramientas y fuentes de datos mediante servidores MCP. |
| `criterios/herramientas-no-code.md` | Patrones y buenas prácticas en plataformas visuales de automatización. |
| `criterios/apis-modelos.md` | Selección de modelos, manejo de llamadas, costos y límites de API. |

## Sub-skills

Aquí se listan los procedimientos completos de este dominio a medida que se aprueben.

- [`sub-skills/auditar-seguridad-ia.md`](sub-skills/auditar-seguridad-ia.md): auditar la seguridad de una app, agente o flujo con IA en 10 puntos (OWASP Top 10 para LLMs, 2026).

## Reglas de mantenimiento

- Cada criterio guarda su fuente (enlace y fecha) en `fuentes.md`.
- Cuando un subtema acumula cinco o más criterios relacionados, se propone ascenderlo a sub-skill.
- Cuando un contenido nuevo contradice un criterio existente, se pregunta al usuario cuál prevalece.
- Los cambios entran como propuesta y se instalan tras la aprobación del usuario.
