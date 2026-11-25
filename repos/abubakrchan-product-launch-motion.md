# product-launch-motion (AbubakrChan/product-launch-motion)

**Qué hace:** Skill de Claude Code que toma la URL de un sitio web y produce un video de lanzamiento de 30 segundos a 60 fps, con cursor que guía cada cambio, grano de película, música y efectos sincronizados al ritmo.

**Enlace y estado:** [github.com/AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) · 535 estrellas · último commit 2026-10-21 · MIT (los videos de muestra quedan fuera de la licencia, ver `NOTICE`).

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: videos de lanzamiento de productos, servicios o páginas de clientes con estética de Dribbble.

**Riesgos:**

- Requiere Node 20+, Playwright, FFmpeg y Python 3 con numpy. Todo corre en local y sin costo.
- El autor recomienda Claude Opus 5.5 para obtener el nivel de detalle.
- La música corre por cuenta de quien la use: conviene una pista libre de derechos de unos 120 BPM.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg python
pip3 install numpy
npx skills add AbubakrChan/product-launch-motion
# Actualizar más adelante:
npx skills update
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
