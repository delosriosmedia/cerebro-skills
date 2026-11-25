# Mapa del cerebro

Índice vivo de todo el cerebro. Claude lo lee antes de interpretar cada guardado para ubicarlo en el lugar correcto. Se actualiza con cada propuesta aprobada y con la rutina nocturna.

## Skills madre

| Skill | Ruta | Criterios |
| --- | --- | --- |
| Diseño gráfico | `plugins/cerebro/skills/diseno-grafico/` | tipografia, color, composicion, identidad-visual, piezas-redes, visualizacion-datos |
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
| Selector de estilos de animación | `plugins/cerebro/skills/selector-animacion/` | Galería con la muestra animada de 10 estilos hechos con código y 8 estilos de IA de video desde una imagen, recursos y prompts base; la activa el hook `plugins/cerebro/hooks/selector-animacion.sh` al mencionar una animación |
| Selector de herramientas para apps con IA | `plugins/cerebro/skills/selector-herramientas-ia/` | Galería con maquetas de lo que produce pdfme, Unstract, DocETL y assistant-ui, y pregunta cuál usar; la activa el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` al hablar de PDF en serie, extraer datos de documentos, análisis en lote o chats con IA |
| Selector de redacción | `plugins/cerebro/skills/selector-redaccion/` | Galería con el mismo texto pasado por edit-copy y por humanizer, y pregunta si usar una, la otra, las dos o ninguna; la activa el hook `plugins/cerebro/hooks/sugerir-redaccion.sh` al pedir copy, anuncios, posts, guiones, correos, landings o botones |
| Experto en color | `plugins/cerebro/skills/experto-color/` | Mide los colores de una pieza, interfaz o paleta, deja tres, asigna 60/30/10 (C-001), corrige con psicología del color y propone paletas de su biblioteca (34 paletas y 32 pares de texto y fondo, con contraste medido y galería; guías de modo oscuro y casos reales); la activa el hook `plugins/cerebro/hooks/sugerir-color.sh` al trabajar colores o paletas |
| Estilo retro para interfaces | `plugins/cerebro/skills/estilo-retro/` | Galería de dieciséis estilos retro (aparatos, sistemas de época, pantallas y juegos, impresos y web temprana) y brief para la skill dueña del estilo; el hook `plugins/cerebro/hooks/sugerir-estilo-retro.sh` la ofrece como una opción más al diseñar una interfaz visual |
| Pirámide de reglas | `plugins/cerebro/skills/piramide-reglas/` | Ubica cada regla de un proyecto con agentes en cinco pisos (diseño del código, análisis estático, verificación en ejecución, texto, revisión humana) y la baja al piso más bajo que la sostiene (C-003 de `claude-mods/flujos-claude`); modo planear y modo auditar, con `/cerebro:piramide-reglas`; el hook `plugins/cerebro/hooks/sugerir-piramide-reglas.sh` la ofrece al planear un proyecto de código o al pedir una auditoría o reestructuración |
| Componentes complejos de ReUI | `plugins/cerebro/skills/componentes-reui/` | Galería con maquetas de cinco componentes React gratuitos de ReUI (Gantt, data grid, calendario de eventos, constructor de filtros, cascader), pregunta cuál usar y lo instala con la CLI de shadcn (ficha `repos/keenthemes-reui.md`); la activa el hook `plugins/cerebro/hooks/sugerir-componentes-reui.sh` al pedir uno de esos componentes en React |

## Sub-skills

| Sub-skill | Skill madre | Ruta | Qué hace |
| --- | --- | --- | --- |
| Auditar la seguridad de una app con IA | Automatización y agentes con IA | `plugins/cerebro/skills/automatizacion-ia/sub-skills/auditar-seguridad-ia.md` | Elige según el contexto qué riesgos del OWASP Top 10 para LLMs (2026) revisar; la sugiere el hook `plugins/cerebro/hooks/sugerir-seguridad-ia.sh` |
| Montar un proyecto de producción con Claude Code | Claude, sus skills, plugins, MCP y configuración | `plugins/cerebro/skills/claude-mods/sub-skills/proyecto-produccion-claude-code.md` | Ocho pasos para construir con Claude Code una app de producción, con el ingeniero al mando; la sugiere el hook `plugins/cerebro/hooks/sugerir-proyecto-produccion.sh` |

## Fichas con hook

| Ficha | Hook | Cuándo se activa |
| --- | --- | --- |
| `repos/666ghj-mirofish.md` (MiroFish, ensayo de público con agentes simulados) | `plugins/cerebro/hooks/sugerir-mirofish.sh` | Al auditar una app o web terminada, o al contar que se acaba de lanzar o publicar |

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

- Las gráficas de datos (qué resaltar, anotaciones, storytelling con datos) van a `diseno-grafico/visualizacion-datos`. La regla 60-30-10 de color (C-001) aplica a la interfaz o pieza completa y queda fuera de las gráficas (Angel, 2026-11-25).
- Diseñar APIs propias, servicios de servidor, funciones en la nube y webhooks va a `desarrollo-backend`. `automatizacion-ia/apis-modelos` queda para consumir APIs de modelos de IA (Angel, 2026-11-25).
- Las estéticas de interfaz que Angel quiere tener a mano (por ejemplo, retro) van como skill de apoyo con galería y hook que la ofrece como opción al diseñar, junto a las skills de estilo que ya usa (Angel, 2026-11-25).
