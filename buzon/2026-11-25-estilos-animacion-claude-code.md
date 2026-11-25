# Diez estilos de animación hechos con Claude Code

**Qué es:** un reel de 18 segundos que muestra diez estilos de animación vertical (9:16), cada uno generado con un solo prompt en Claude Code. Sirve como menú visual para elegir estilo cuando se pide una animación explicativa o promocional.

**Fuente:** [Instagram · viashaan](https://www.instagram.com/p/DgGaMp_DCp4/) · guardado el 2026-11-25. Los prompts quedan fuera del post: el autor los envía por mensaje directo a quien comenta «ANIMATE».

## Catálogo de estilos

| # | Estilo | Qué se ve | Movimiento | Uso posible |
| --- | --- | --- | --- | --- |
| 01 | Globe arcs | Globo terráqueo oscuro con puntos; arcos naranjas salen de Londres y Lagos hacia otros países | Contador que sube («21 → 35 countries») mientras los arcos se trazan y el globo gira | Alcance geográfico, envíos, clientes por país |
| 02 | Turntable | Producto (altavoz «Orbe One») sobre base giratoria, fondo negro | Giro de 360°; las especificaciones (IP67, 40 h, 360°) aparecen una a una con líneas guía | Ficha de producto, lanzamiento |
| 03 | Hologram | Planta industrial isométrica en azul translúcido | Barrido lento de cámara; un módulo se enciende en rojo para señalar una alerta | Infraestructura, procesos, fallas en un sistema |
| 04 | Flat cartoon | Personaje 2D plano en oficina frente a una gráfica de ventas | La flecha de la gráfica cae, el personaje levanta los brazos y vuelan notas adhesivas | Historias de negocio con humor, antes y después |
| 05 | 3D map route | Ciudad isométrica blanca con calles y río | La cámara sigue una ruta azul que se dibuja sola por las calles | Recorridos, logística, entregas |
| 06 | Billboard | Valla en una autopista nocturna con estelas de luz roja | Cámara que avanza; la valla cambia de anuncio («Black Friday» → frasco de producto) | Maquetas de publicidad exterior |
| 07 | Ink doodle | Muñeco dibujado a mano en un banco del parque, cartel «Before phones» | Viento que arrastra papeles y sombrero; gestos con trazo de tinta | Narrativas cotidianas, nostalgia, contrastes de época |
| 08 | Glow world | Cristal facetado con cara sonriente en un mundo espacial low poly morado | Brillo pulsante, la cara aparece y surge la etiqueta «AI core» | Mascota o concepto de IA, tecnología amable |
| 09 | 3D teardown | Teclado mecánico flotando sobre fondo negro | Despiece vertical capa por capa (teclas, switches, placa, PCB) con etiquetas técnicas | Anatomía de producto, «cómo está hecho» |
| 10 | Iceberg dive | Iceberg low poly en agua azul clara | La cámara baja bajo el agua y revela capas con etiquetas («The result», «Failed attempts», «Late nights», «The system») | Lo visible y lo oculto de un proceso o éxito |

## Estructura del reel

- Fondo marrón con degradado, título serif en cursiva «10 Claude Animation styles», lista numerada a la izquierda y vista vertical a la derecha.
- Cada estilo dura entre 1,5 y 2 segundos; el número activo se ilumina en dorado.
- Cierre con un mosaico de seis estilos y la llamada «Comment Animate for every prompt».

## Cómo conseguir cada estilo

Investigación del 2026-11-25. Claude Code produce estas animaciones escribiendo código que dibuja cada cuadro (three.js para 3D, GSAP o Remotion para 2D) y grabándolo a MP4 con un navegador sin ventana. Siete de los diez estilos ya tienen una skill o un estilo listo en repositorios públicos; los otros tres se arman con el prompt base de más abajo.

| # | Estilo | Recurso listo | Cómo pedirlo |
| --- | --- | --- | --- |
| 01 | Globe arcs | Sin recurso exacto | Prompt base 01 |
| 02 | Turntable | Lemo-Opuscar · «Glass Product Render» (producto girando con luz de estudio) | Prompt base 02, o el estilo de Lemo-Opuscar |
| 03 | Hologram | Lemo-Opuscar · «Sci-fi Hologram HUD»; animation-styles · «Hologram HUD» | «Make a film in the Sci-fi Hologram HUD style about…» |
| 04 | Flat cartoon | Lemo-Opuscar · «Mid-century Cartoon»; animation-styles · «Flat vector» | «Use animation-styles to make a 5-second video of… in flat vector style» |
| 05 | 3D map route | claude-animation-skills · `/map-route` (ciudad blanca, ruta que se dibuja, pin, ETA) | `/map-route casa al gimnasio, 2,8 km` |
| 06 | Billboard | Sin recurso exacto | Prompt base 06 |
| 07 | Ink doodle | claude-animation-skills · `/stick-figure`; Lemo-Opuscar · «Stick-figure Explainer» | `/stick-figure <pregunta o historia>` |
| 08 | Glow world | Lemo-Opuscar · «Low-poly Isometric Island» (base low poly para adaptar) | Prompt base 08 |
| 09 | 3D teardown | claude-animation-skills · `/breakdown`; Lemo-Opuscar · «Exploded Teardown: 21 Keys» (el mismo teclado) | `/breakdown mi teclado, cada capa con su etiqueta` |
| 10 | Iceberg dive | Sin recurso exacto | Prompt base 10 |

### Repositorios encontrados

| Repositorio | Qué trae | Licencia | Instalación |
| --- | --- | --- | --- |
| [artemnovitckii/claude-animation-skills](https://github.com/artemnovitckii/claude-animation-skills) | 11 skills para reels 9:16: `/map-route`, `/breakdown`, `/stick-figure`, `/low-poly`, `/kurzgesagt` y más; revisa la zona segura de Instagram | ver repositorio | `git clone` y `./install.sh` (requiere ffmpeg, Node 18+, Python 3.9+) |
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 99 estilos, cada uno con prompt de estilo y película de muestra | código MIT; prompts CC BY-NC 4.0 (uso propio permitido, también en piezas comerciales) | `claude plugin marketplace add lemomo-ai/lemo-opuscar` y `claude plugin install lemo-opuscar@lemolab` |
| [deenukhan/animation-styles](https://github.com/deenukhan/animation-styles) | 39 estilos con Remotion, «cuenta tu historia en estilo X» | MIT (Remotion con licencia propia) | `git clone` en `~/.claude/skills/animation-styles` y `npm install` |
| [XiaoyeCodes/code-animation-prompts](https://github.com/XiaoyeCodes/code-animation-prompts) | 341 prompts de estilo en chino con selector visual (incluye flat, doodle, low poly, holograma, despiece) | ver repositorio | `python scripts/install_skill.py --target claude` |
| [elvarofficial/teardown](https://github.com/elvarofficial/teardown) | Simuladores 3D desarmables de máquinas en una página HTML, con video a 60 fps | MIT | `npx skills add elvarofficial/teardown -g -a claude-code` |

### Prompts base para los estilos sin recurso

Redactados por Claude a partir de lo que muestra el reel; quedan por probar. Cada uno pide un MP4 vertical 1080×1920 a 30 fps.

**01 · Globe arcs**

```text
Crea una animación vertical 1080x1920, 6 s, 30 fps, en un solo HTML con three.js, y grábala a MP4 con Playwright y ffmpeg.
Escena: globo terráqueo azul noche hecho de puntos, que gira despacio. Desde {ciudad origen} salen arcos naranjas brillantes hacia {lista de ciudades}, uno cada 0,3 s, trazándose de origen a destino con una cola de luz.
Arriba, un contador grande «{N} countries» que sube al ritmo de cada arco, con etiqueta pequeña «{etiqueta}» en mayúsculas espaciadas.
Etiquetas finas junto a cada ciudad. Easing suave, cámara fija con un leve acercamiento al final.
```

**02 · Turntable**

```text
Animación vertical 1080x1920, 6 s, 30 fps, three.js, exportada a MP4.
Producto: {descripción del producto} sobre una base giratoria negra, fondo degradado oscuro, luz de estudio con reflejo suave.
El producto gira 360° en todo el video. Arriba, el nombre «{nombre}». Las especificaciones {lista de specs} aparecen una por una cada 0,8 s, cada una con una línea guía fina que apunta a su zona del producto.
```

**06 · Billboard**

```text
Animación vertical 1080x1920, 5 s, 30 fps, three.js, exportada a MP4.
Autopista de noche con ciudad al fondo; estelas de luces rojas de autos en movimiento. La cámara avanza hacia una valla elevada iluminada por reflectores.
La valla muestra {anuncio 1} y a mitad del video cambia a {anuncio 2} con un barrido de luz, como en una maqueta de publicidad exterior. Pasa una señal verde de autopista en primer plano.
```

**08 · Glow world**

```text
Animación vertical 1080x1920, 5 s, 30 fps, three.js, exportada a MP4.
Mundo low poly morado y azul en el espacio, con asteroides y estrellas. En el centro flota un cristal facetado amarillo con borde rosa que pulsa con brillo interior; junto a él, un cristal rosa más pequeño y una base circular con anillo de luz.
A mitad del video aparece en el cristal una cara simple sonriente y surge la etiqueta «{etiqueta}» con un punto amarillo. Flotación suave y bloom.
```

**10 · Iceberg dive**

```text
Animación vertical 1080x1920, 6 s, 30 fps, three.js o SVG, exportada a MP4.
Iceberg low poly blanco y celeste en agua azul clara. Arriba del agua, la punta con la etiqueta «{lo visible}».
La cámara baja en un movimiento continuo bajo la superficie y revela capas del iceberg, cada una con una etiqueta en píldora blanca: {capa 1}, {capa 2}, {capa 3}. La línea de flotación se ve como una línea blanca que sube por el cuadro.
```

## Ideas que podría alimentar

- Un criterio en `produccion-video/criterios/ia-video.md` con el menú de estilos para pedir animaciones a Claude Code.
- Los prompts base de arriba, en `prompts/biblioteca/`, cuando se prueben y den buen resultado.
- Fichas en `repos/` para claude-animation-skills y Lemo-Opuscar, si Angel quiere instalarlas.
- La skill `selector-hyperframes`, si estos estilos se reproducen con HyperFrames.

## Relación con el cerebro

Complementa la ficha `repos/tugrawork-creator-saas-motion-kit.md` (101 temas visuales para promos de software): ese kit cubre temas de interfaz y este catálogo cubre estilos narrativos e ilustrados.
