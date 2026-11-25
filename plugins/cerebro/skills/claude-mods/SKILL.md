---
name: claude-mods
description: Usa esta skill cuando crees o configures skills, plugins, servidores MCP, hooks y ajustes de Claude Code, o cuando diseñes flujos de trabajo personalizados en Claude (Claude Code, skills, plugins, MCP server, hooks).
---

# Claude, sus skills, plugins, MCP y configuración

## Propósito

Esta skill reúne los criterios sobre personalización y extensión de Claude guardados por el usuario. Sirve como punto de entrada para construir skills, empaquetar plugins, ajustar la configuración de Claude Code, conectar servidores MCP y optimizar flujos de trabajo.

## Cómo trabajar con esta skill

1. Identificar qué subtemas toca la tarea.
2. Leer solo los archivos de `criterios/` correspondientes a esos subtemas.
3. Aplicar los criterios encontrados y citar el archivo usado.
4. Seguir la sub-skill correspondiente cuando exista una que cubra la tarea completa.
5. Cuando la tarea aborde un aspecto nuevo que falte en los criterios, trabajar con buen criterio profesional y anotarlo al final como "posible criterio nuevo" para que el usuario decida si se guarda.

## Mapa de criterios

| Archivo | Qué cubre |
| --- | --- |
| `criterios/skills-plugins.md` | Estructura, redacción, empaquetado y activación de skills y plugins. |
| `criterios/claude-code-config.md` | Archivos de configuración, permisos, hooks, comandos y memoria de proyecto. |
| `criterios/servidores-mcp.md` | Instalación, configuración y uso seguro de servidores MCP en Claude. |
| `criterios/flujos-claude.md` | Modos de trabajo, subagentes y rutinas productivas con Claude. |

## Sub-skills

Aquí se listan los procedimientos completos de este dominio a medida que se aprueben.

- [`sub-skills/proyecto-produccion-claude-code.md`](sub-skills/proyecto-produccion-claude-code.md): lista de verificación de ocho pasos para construir con Claude Code una app que va a producción (arquitectura, diseño propio, documentación por MCP, prompts, decisiones, aprobaciones, pruebas y triaje de errores). La sugiere el hook `hooks/sugerir-proyecto-produccion.sh`.

## Reglas de mantenimiento

- Cada criterio guarda su fuente (enlace y fecha) en `fuentes.md`.
- Cuando un subtema acumula cinco o más criterios relacionados, se propone ascenderlo a sub-skill.
- Cuando un contenido nuevo contradice un criterio existente, se pregunta al usuario cuál prevalece.
- Los cambios entran como propuesta y se instalan tras la aprobación del usuario.
