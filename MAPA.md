# Mapa del cerebro

Índice vivo de todo el cerebro. Claude lo lee antes de interpretar cada guardado para ubicarlo en el lugar correcto. Se actualiza con cada propuesta aprobada y con la rutina nocturna.

## Skills madre

| Skill | Ruta | Criterios |
| --- | --- | --- |
| Diseño gráfico | `plugins/cerebro/skills/diseno-grafico/` | tipografia, color, composicion, identidad-visual, piezas-redes |
| Experiencia e interfaz de usuario | `plugins/cerebro/skills/ux-ui/` | principios-ux, interfaz-visual, accesibilidad, patrones-componentes, microcopy |
| Ingeniería de prompts y biblioteca de prompts | `plugins/cerebro/skills/prompts/` | estructura-prompts, prompts-texto, prompts-imagen, prompts-video |
| Automatización y agentes con IA | `plugins/cerebro/skills/automatizacion-ia/` | flujos-agentes, integraciones-mcp, herramientas-no-code, apis-modelos |
| Claude, sus skills, plugins, MCP y configuración | `plugins/cerebro/skills/claude-mods/` | skills-plugins, claude-code-config, servidores-mcp, flujos-claude |
| Producción de video para redes con y sin IA | `plugins/cerebro/skills/produccion-video/` | guion-gancho, edicion-ritmo, ia-video, audio-subtitulos |
| Desarrollo backend | `plugins/cerebro/skills/desarrollo-backend/` | diseno-apis (lo sugiere el hook `plugins/cerebro/hooks/sugerir-diseno-apis.sh`) |

## Skills de apoyo

| Skill | Ruta | Qué hace |
| --- | --- | --- |
| Selector de extensiones de HyperFrames | `plugins/cerebro/skills/selector-hyperframes/` | Galería visual y pregunta de qué extensiones usar; la activa el hook `plugins/cerebro/hooks/selector-hyperframes.sh` al mencionar HyperFrames |
| Selector de estilos de animación | `plugins/cerebro/skills/selector-animacion/` | Galería con la muestra animada de 10 estilos, recursos y prompts base; la activa el hook `plugins/cerebro/hooks/selector-animacion.sh` al mencionar una animación |
| Selector de herramientas para apps con IA | `plugins/cerebro/skills/selector-herramientas-ia/` | Galería con maquetas de lo que produce pdfme, Unstract, DocETL y assistant-ui, y pregunta cuál usar; la activa el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` al hablar de PDF en serie, extraer datos de documentos, análisis en lote o chats con IA |

## Sub-skills

| Sub-skill | Skill madre | Ruta | Qué hace |
| --- | --- | --- | --- |
| Auditar la seguridad de una app con IA | Automatización y agentes con IA | `plugins/cerebro/skills/automatizacion-ia/sub-skills/auditar-seguridad-ia.md` | Elige según el contexto qué riesgos del OWASP Top 10 para LLMs (2026) revisar; la sugiere el hook `plugins/cerebro/hooks/sugerir-seguridad-ia.sh` |

## Destinos posibles de un guardado

| Lo que llega | Destino |
| --- | --- |
| Un consejo o regla puntual | Criterio dentro de una skill madre (`criterios/<subtema>.md`) |
| Un procedimiento completo con pasos | Sub-skill dentro de la skill madre, o skill madre nueva si abre un dominio |
| Un prompt listo para usar | `prompts/biblioteca/` con su caso de uso |
| Un repositorio, MCP, plugin o mod | Ficha en `repos/` con propuesta de instalación |
| Una idea sin uso claro todavía | `buzon/`, disponible para búsquedas futuras |

## Reglas de clasificación aprendidas

Cada corrección de Angel se guarda aquí como regla y guía las interpretaciones siguientes.

- Diseñar APIs propias, servicios de servidor, funciones en la nube y webhooks va a `desarrollo-backend`. `automatizacion-ia/apis-modelos` queda para consumir APIs de modelos de IA (Angel, 2026-11-25).
