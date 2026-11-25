# hyperframes-motion-library (nutllwhy/hyperframes-motion-library)

**Qué hace:** Biblioteca local de plantillas de motion graphics para HyperFrames (el video menciona 23; el README actual lista 27): gráficas, explicativos y más, que se llenan con contenido propio. Ofrece edición de parámetros, render por lotes, exportación con fondo transparente (MOV y WebM) y un `SKILL.md` legible por agentes. Documentación en chino.

**Enlace y estado:** [github.com/nutllwhy/hyperframes-motion-library](https://github.com/nutllwhy/hyperframes-motion-library) · 326 estrellas · último commit 2026-10-28 · MIT.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: gráficas animadas y piezas explicativas listas para insertar en videos de redes, incluso con fondo transparente para superponer en la edición.

**Riesgos:**

- Requiere Node, Chrome y FFmpeg. Render 100 % local, sin claves.
- Se usa como app local (`npm run dev`); el `SKILL.md` del repo permite que Claude la maneje.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install node ffmpeg
git clone https://github.com/nutllwhy/hyperframes-motion-library.git
cd hyperframes-motion-library
npm install
npm run dev
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
