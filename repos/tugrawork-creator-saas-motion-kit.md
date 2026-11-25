# saas-motion-kit (tugrawork-creator/saas-motion-kit)

**Qué hace:** Kit para videos promocionales de software con HyperFrames y Claude Code: 101 temas visuales, un atlas de 24 transiciones, seis películas de ejemplo a partir de un mismo guion y una auditoría de variedad del storyboard para que cada video tenga identidad propia.

**Enlace y estado:** [github.com/tugrawork-creator/saas-motion-kit](https://github.com/tugrawork-creator/saas-motion-kit) · 295 estrellas · último commit 2026-10-04 · MIT para código y documentación; fuentes bajo OFL 1.1.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: videos promocionales con estilos variados y una revisión que evita repetir la misma fórmula visual.

**Riesgos:**

- Requiere Node.js 22+, FFmpeg y Claude Code.
- El flujo opcional de tomas con fal (`tools/fal_shots.py`) usa un servicio de pago con credenciales propias.
- La música MusicGen incluida es CC-BY-NC: uso no comercial.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg
git clone https://github.com/tugrawork-creator/saas-motion-kit && cd saas-motion-kit
npx skills add heygen-com/hyperframes
cd examples/acme-suite-loop
npx hyperframes preview
# Dentro de Claude Code, en la raíz del repo:
/saas-motion-video
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
