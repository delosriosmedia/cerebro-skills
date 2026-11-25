# Cerebro de skills

**Qué es:** un plugin de skills para Claude que crece con lo que Angel guarda en redes sociales. Cada video o post sobre inteligencia artificial que Angel guarda en Instagram, Threads, Facebook o YouTube pasa por un análisis de Claude, una conversación corta con Angel y una aprobación. Lo aprobado entra a este repositorio como criterio, prompt, sub-skill, skill nueva o ficha de herramienta.

**Para quién es esta guía:** para cualquier persona y para cualquier modelo de lenguaje que lea el repositorio. Cada sección empieza con su idea principal.

## Cómo está organizado

| Ruta | Qué contiene | Quién la lee |
| --- | --- | --- |
| `MAPA.md` | Índice completo del cerebro: skills madre, archivos de criterios, destinos posibles y reglas de clasificación aprendidas | Claude, antes de clasificar cada guardado |
| `plugins/cerebro/skills/<skill>/SKILL.md` | La puerta de entrada de un dominio: cuándo usar la skill y cómo trabajar con ella | Claude, cuando una tarea toca ese dominio |
| `plugins/cerebro/skills/<skill>/criterios/` | Reglas cortas por subtema, cada una con su fuente | Claude, solo los subtemas que la tarea necesita |
| `plugins/cerebro/skills/<skill>/fuentes.md` | Registro de cada guardado que alimentó la skill | Personas que quieren volver al contenido original |
| `plugins/cerebro/skills/prompts/biblioteca/` | Prompts listos para usar, un archivo por prompt | Personas y Claude |
| `repos/` | Fichas de evaluación de repositorios, servidores MCP, plugins y mods | Angel, antes de instalar algo |
| `buzon/` | Guardados de referencia que esperan un uso claro | La rutina nocturna de consolidación |
| `.claude/skills/revisar-guardados/` | Procedimiento del hilo que hace las preguntas y pide las aprobaciones | Claude, en cada revisión |
| `supabase/migrations/` | Esquema de la base de datos del motor que procesa los guardados | Quien monte o mantenga el motor |
| `.claude-plugin/marketplace.json` | Catálogo que permite instalar el plugin | Claude Code y la app de Claude |

## Las seis skills madre

| Skill | Dominio |
| --- | --- |
| `diseno-grafico` | Tipografía, color, composición, identidad visual y piezas para redes |
| `ux-ui` | Principios de UX, interfaz visual, accesibilidad, componentes y microcopy |
| `prompts` | Estructura de prompts y prompts de texto, imagen y video, más la biblioteca |
| `automatizacion-ia` | Agentes, integraciones MCP, herramientas no-code y APIs de modelos |
| `claude-mods` | Skills, plugins, configuración de Claude Code, servidores MCP y flujos con Claude |
| `produccion-video` | Guion y gancho, edición y ritmo, IA para video, audio y subtítulos |

## Cómo llega un guardado al cerebro

1. **Captura.** Angel comparte el enlace a un bot de Telegram o guarda el video en su lista «Cerebro» de YouTube.
2. **Extracción.** El motor obtiene el texto del post, la transcripción, el texto que aparece en pantalla y los repositorios enlazados.
3. **Interpretación.** Claude lee ese contenido junto con `MAPA.md` y propone un tipo (criterio, prompt, sub-skill, skill nueva, herramienta o referencia) y un destino.
4. **Preguntas.** En el hilo «Revisar guardados nuevos» del proyecto de Claude, Claude le muestra a Angel lo que entendió y de una a tres preguntas en tarjetas de un toque.
5. **Propuesta.** Claude redacta el cambio y abre un pull request en este repositorio.
6. **Aprobación.** Angel toca «Aprobar e instalar» en la tarjeta; Claude fusiona el pull request y el cambio queda instalado.

Una tarea programada despierta el hilo de revisión y revisa la cola en Supabase. El procedimiento completo está en [`.claude/skills/revisar-guardados/SKILL.md`](.claude/skills/revisar-guardados/SKILL.md).

El motor corre en la nube (Supabase, Telegram, Apify, la API de Gemini y la API de Claude). Sus datos y credenciales viven en servicios privados; este repositorio guarda solo el conocimiento aprobado y el esquema de la base de datos.

## Cómo instalar el plugin

En Claude Code:

```
/plugin marketplace add delosriosmedia/cerebro-skills
/plugin install cerebro@cerebro-angel
```

Para recibir cada cambio aprobado de forma automática, activa «Enable auto-update» en `/plugin`, sección Marketplaces.

En la app de Claude: Plugins, «Add marketplace», y el nombre `delosriosmedia/cerebro-skills`.

## Formato de un criterio

Cada criterio vive en el archivo de su subtema y sigue esta plantilla:

```markdown
### C-001 · Título corto
- **Regla:** la indicación en una o dos frases
- **Cuándo aplica:** la situación
- **Fuente:** enlace · fecha
```

Cada criterio suma además una fila en el `fuentes.md` de su skill.

## Privacidad

Este repositorio es público. Contiene enlaces a publicaciones públicas y el conocimiento derivado de ellas. Las reglas completas están en [PRIVACIDAD.md](PRIVACIDAD.md).

## Glosario

- **Skill madre:** la skill principal de un dominio; carga sus criterios a demanda.
- **Criterio:** una regla corta y aplicable, con su fuente.
- **Sub-skill:** un procedimiento completo dentro de una skill madre, con pasos.
- **Guardado:** un video o post que Angel guardó en una red social.
- **Ficha:** la evaluación de un repositorio o herramienta antes de instalarlo.
- **Motor:** el sistema en la nube que captura, extrae, interpreta y pregunta.
