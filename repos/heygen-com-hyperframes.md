# HyperFrames (heygen-com/hyperframes)

**Qué hace:** Motor de video de código abierto de HeyGen: cada composición es un archivo HTML con animaciones GSAP, y HyperFrames la renderiza a MP4 con Chrome sin interfaz y FFmpeg. Claude Code escribe y edita los videos a partir de instrucciones en lenguaje natural. Es la base que necesitan los otros nueve repos de esta serie.

**Enlace y estado:** [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) · 89,6 k estrellas · último commit 2026-11-25 · Apache-2.0.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: crear videos de motion graphics, explicativos y piezas para redes desde Claude Code, escribiendo HTML en lugar de editar en una línea de tiempo.

**Riesgos:**

- Requiere Node.js 22 o superior y FFmpeg.
- El CLI local funciona sin clave de API. La app Studio tiene plan gratuito y plan Pro de pago (25 USD al mes); el render en la nube es opcional.
- Mantenido por HeyGen, con actividad diaria.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
# Alternativa como skill suelta (elegir «Core Skills»):
npx skills add heygen-com/hyperframes
# Primer proyecto de prueba:
npx hyperframes init mi-video
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
