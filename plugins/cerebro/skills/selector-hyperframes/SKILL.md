---
name: selector-hyperframes
description: Úsala cada vez que Angel pida un video con HyperFrames (motion graphics desde HTML y GSAP). Antes de escribir la composición, muestra la galería visual de extensiones instaladas y pregunta cuáles usar.
---

# Selector de extensiones de HyperFrames

Angel tiene instalado HyperFrames y ocho extensiones que amplían lo que produce. Esta skill le muestra cada extensión con su resultado en imagen, le pregunta cuáles quiere y aplica solo las elegidas.

## Cuándo se activa

- Angel pide un video, animación o pieza con HyperFrames.
- El hook `hooks/selector-hyperframes.sh` del plugin detecta la palabra «HyperFrames» en el mensaje, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer mensaje de la sesión; en los siguientes, abrirla si Angel la pide.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion, selección múltiple), preguntar qué extensiones usar. Recomendar de una a tres según el pedido, con la tabla de abajo, y ofrecer «Solo HyperFrames base».
3. **Carga.** Seguir la columna «Cómo se usa» de cada extensión elegida.
4. **Composición.** Escribir el video con HyperFrames combinando lo elegido, y renderizar una vista previa para que Angel la apruebe antes del render final.
5. **Aprendizaje.** Si Angel cuenta por qué eligió o descartó algo, ofrecer guardarlo como criterio en `produccion-video`.

## Extensiones instaladas

Las carpetas clonadas viven en `~/HyperFrames-extensiones/`.

| Extensión | Qué produce | Ideal para | Cómo se usa |
| --- | --- | --- | --- |
| huashu-design | Diseños completos y videos con cámara virtual GSAP (paneos, zoom, travelling) | Piezas con estética editorial, presentaciones animadas | Skill `huashu-design` |
| tegaki | Texto que se escribe a mano, trazo por trazo, con cualquier fuente | Títulos, firmas, frases destacadas | Importar `tegaki` (npm) dentro de la composición |
| product-launch-motion | Video de lanzamiento de 30 s a 60 fps con cursor, grano y efectos al ritmo | Lanzar un producto, servicio o página web | Skill `product-launch-motion`, a partir de una URL |
| hyperframes-motion-library | Plantillas de gráficas, cifras y explicativos, con fondo transparente | Datos animados para insertar en otro video | App local: `cd ~/HyperFrames-extensiones/hyperframes-motion-library && npm run dev`; su `SKILL.md` guía a Claude |
| saas-motion-kit | 101 temas visuales, 24 transiciones y auditoría de variedad | Promos de software o apps con estilo propio en cada video | Abrir Claude Code en `~/HyperFrames-extensiones/saas-motion-kit` y usar `/saas-motion-video` |
| reelforge | Shorts narrados y subtitulados con fragmentos y transiciones probados | Reels a partir de una idea en una línea | Skill registrada desde `~/HyperFrames-extensiones/reelforge/skills/reelforge/SKILL.md` |
| animated-diagrams-skill | Diagramas, flujos y código que se dibujan solos (MP4, GIF, SVG) | Explicar procesos, arquitecturas o pasos | Skill `animated-svg` y agente `diagram-animator` |
| design-engineering | Revisión de calidad visual y sonido derivado del movimiento | Pulir el resultado antes del render final | Skill `design-engineering` (`/design-engineering review`) |

HeyGen publica las skills oficiales de HyperFrames también para Codex (`openai/plugins`); en Claude Code las aporta la instalación base de HyperFrames.

## Fichas completas

Cada extensión tiene su ficha con riesgos y licencias en `repos/` del repositorio `delosriosmedia/cerebro-skills`.

## Fuente

[10 GitHub Repos That Level Up HyperFrames Videos](https://www.youtube.com/watch?v=Dx6c5isxnN0) · YouTube · guardado el 2026-11-25. Selector pedido por Angel el 2026-11-25.
