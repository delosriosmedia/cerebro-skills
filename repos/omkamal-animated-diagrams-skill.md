# animated-diagrams-skill (omkamal/animated-diagrams-skill)

**Qué hace:** Skill de Claude (nombre interno `animated-svg`) que convierte una descripción en lenguaje natural, o un diagrama PNG, SVG, Mermaid o PlantUML, en una animación coreografiada con GSAP. Entrega MP4, GIF, SVG y un reproductor HTML interactivo.

**Enlace y estado:** [github.com/omkamal/animated-diagrams-skill](https://github.com/omkamal/animated-diagrams-skill) · 51 estrellas · último commit 2026-06-12 · Apache-2.0 (componentes incluidos con licencias propias: OFL, CC-BY 4.0, GSAP).

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: diagramas de procesos y flujos que se dibujan solos, ideales para videos explicativos.

**Riesgos:**

- Requiere Node 22+, FFmpeg y Python 3.8+.
- `setup.sh` instala dependencias npm, descarga Chrome y GSAP y hace un render de prueba.
- Descarga iconos de Iconify mientras se crea el diagrama.
- Proyecto pequeño, último cambio en junio de 2026.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg python
git clone https://github.com/omkamal/animated-diagrams-skill.git
cd animated-diagrams-skill
bash scripts/setup.sh
mkdir -p ~/.claude/skills ~/.claude/agents
ln -s "$(pwd)" ~/.claude/skills/animated-svg
cp agents/diagram-animator.md ~/.claude/agents/
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
