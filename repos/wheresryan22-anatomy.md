# Anatomy (wheresryan22/anatomy)

**Qué hace:** Skill de Claude que explica una idea técnica inventando un objeto físico cuyo funcionamiento es el concepto, y lo construye como figura isométrica interactiva. Cada figura tiene decenas de piezas sombreadas, un recuadro con título y lectura en vivo, y se mueve con el mouse y el teclado (por ejemplo, un motor que se despieza al pasar el cursor). Entrega una página HTML, un SVG suelto o componentes React; los efectos de fuego, agua y luz van en WebGL.

**Enlace y estado:** [github.com/wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) · miles de estrellas en sus primeros días (noviembre de 2026) · licencia MIT · CI activo.

**Para qué le sirve a Angel:** skill madre `claude-mods` (subtema `skills-plugins`). Uso: figuras interactivas que explican cómo funciona algo, para páginas web, landings y explicativos que la persona explora con el mouse.

**Riesgos:**

- Requiere Node 20.10 o superior; usa solo módulos propios de Node, sin `npm install`.
- Sus chequeos abren Chrome o Chromium sin ventana para capturar y revisar cada figura.
- Cada figura toma varios minutos: arma la lista de piezas, la geometría, una auditoría de choques y acercamientos a cada unión en tema claro y oscuro.
- El modo 3D está en beta. Dibuja máquinas, instrumentos, herramientas y muebles; las personas y los mapas exactos quedan fuera de su alcance.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
# Claude Code
npx skills add wheresryan22/anatomy -g -a claude-code
# Antigravity
npx skills add wheresryan22/anatomy -g -a antigravity
```

Uso: `/anatomy explica cómo funciona <idea>, interactivo`.

**Decisión:** pendiente · 2026-11-25.

**Fuente:** [5 Claude skills that save you hours](https://www.instagram.com/p/Dfr2yaUCMDl/), carrusel de Instagram · guardado el 2026-11-25.
