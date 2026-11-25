# Reelforge (gongnyang/reelforge)

**Qué hace:** Fábrica de video para agentes: de una idea en una línea a un video narrado, subtitulado y editable por escenas, en formato corto o largo. Usa una galería de fragmentos de movimiento y pares de transición probados en render, sobre HyperFrames, con una pila gratuita sin claves. Documentación en coreano.

**Enlace y estado:** [github.com/gongnyang/reelforge](https://github.com/gongnyang/reelforge) · 126 estrellas · último commit 2026-07-30 · Apache-2.0.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: transiciones y fragmentos de animación ya verificados para armar shorts más rápido.

**Riesgos:**

- Requiere Node y el CLI de HyperFrames; render en local con Chrome.
- `npm ci` ejecuta los scripts de instalación de sus dependencias.
- Música, voz y fuentes llevan licencias propias; revisarlas antes de publicar.
- El idioma principal del proyecto es el coreano.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg
git clone https://github.com/gongnyang/reelforge.git && cd reelforge
npm ci
./node_modules/.bin/hyperframes doctor
# Luego abrir la carpeta en Claude Code y registrar skills/reelforge/SKILL.md como skill.
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
