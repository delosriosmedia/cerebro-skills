# Tegaki (gkurt/tegaki)

**Qué hace:** Biblioteca que convierte cualquier fuente tipográfica en escritura a mano animada, trazo por trazo. Trae componentes para React, Svelte, Vue, Solid, Astro y JavaScript puro, y un CLI que exporta SVG.

**Enlace y estado:** [github.com/gkurt/tegaki](https://github.com/gkurt/tegaki) · 3,3 k estrellas · último commit 2026-11-05 · MIT.

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: títulos y frases que se escriben solos en pantalla dentro de una composición HyperFrames o de una web.

**Riesgos:**

- Riesgo bajo: paquete npm sin claves de API ni servicios de pago.
- Es una biblioteca de animación; la integración con HyperFrames la hace Claude al escribir la composición.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
# Prueba rápida, genera un SVG animado:
npx tegaki "Hola mundo"
# Dentro de un proyecto HyperFrames:
npm install tegaki
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
