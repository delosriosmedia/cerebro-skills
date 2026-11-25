# design-engineering (AgentsORG/design-engineering)

**Qué hace:** Skill de calidad de diseño para agentes, con 13 agentes especialistas, un consejo de diseño entre varios modelos, un calificador y pruebas de referencia. Sus herramientas derivan el sonido a partir del movimiento de la animación. Funciona en Claude Code, Codex, Cursor, Gemini CLI y OpenCode.

**Enlace y estado:** [github.com/AgentsORG/design-engineering](https://github.com/AgentsORG/design-engineering) · 23 estrellas · último commit 2026-11-13 · MIT.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: efectos de sonido sincronizados con la animación y una revisión de calidad visual antes de exportar.

**Riesgos:**

- El instalador completo se ejecuta con `curl … | bash`: escribe agentes, un hook PostToolUse y un manifiesto en `~/.claude` (respalda la configuración y trae `--uninstall`).
- El consejo de diseño envía contenido a otros modelos por sus CLI, con costo de API.
- Proyecto nuevo y pequeño. Se propone instalar solo la skill.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
# Solo la skill (recomendado):
npx skills add AgentsORG/design-engineering
# Alternativa como plugin, dentro de Claude Code:
/plugin install design-engineering --marketplace AgentsORG/design-engineering
```
Instalar por una sola vía; dos vías la dejan listada dos veces.

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
