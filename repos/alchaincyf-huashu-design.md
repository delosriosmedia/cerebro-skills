# huashu-design (alchaincyf/huashu-design)

**Qué hace:** Skill de diseño para agentes: con una frase produce prototipos web y de app, presentaciones PPTX editables, infografías, imágenes para tiendas de apps y videos animados. Incluye recetas GSAP seguras para el avance del video (seek-safe) y una cámara virtual para HyperFrames. Documentación en chino.

**Enlace y estado:** [github.com/alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) · 30,8 k estrellas · último commit 2026-11-23 · MIT (los stickers de `assets/style-specimens/xhs/_kit/stickers/` usan PolyForm Shield 1.0.0).

**Para qué le sirve a Angel:** skill madre `produccion-video` (subtema `ia-video`). Uso: movimientos de cámara y animaciones GSAP fiables dentro de HyperFrames; también sirve para la skill `diseno-grafico` (presentaciones, infografías, piezas para redes).

**Riesgos:**

- El trabajo principal corre en local. Los scripts de `scripts/cloud/` (voz Doubao, revisión de video con IA) son opcionales y piden clave propia y la bandera `--yes`.
- La exportación a PDF usa el Chrome instalado.
- El README declara cero telemetría y lista los dominios externos en `SECURITY.md`.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
npx skills add alchaincyf/huashu-design
# Respaldo si faltan archivos:
git clone https://github.com/alchaincyf/huashu-design.git ~/.claude/skills/huashu-design
```

**Decisión:** pendiente · 2026-11-25. Se instala solo cuando Angel lo pida.

**Fuente:** [10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0), YouTube, CookstarCode · guardado el 2026-11-25.
