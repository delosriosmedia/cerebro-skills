---
name: selector-animacion
description: Úsala cada vez que Angel pida una animación o un video animado (reel, explicativo, promo), hecho con código en Claude Code o generado con IA desde una imagen. Antes de empezar, muestra la galería con el resultado de cada estilo, pregunta cuál usar y sigue el recurso o el prompt de ese estilo.
---

# Selector de estilos de animación

Angel elige el estilo mirando el resultado. Esta skill abre una galería con dos familias: doce estilos hechos con código (01 a 12) y ocho estilos generados con IA de video desde una imagen fija (IA-01 a IA-08). Le pregunta cuál quiere y aplica el recurso listo o el prompt base del estilo elegido.

## Cuándo se activa

- Angel pide una animación, un video animado, un reel explicativo o una promo hecha con código.
- El hook `hooks/selector-animacion.sh` del plugin detecta «animación», «animation», «documental» o «Vox» en el mensaje, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer mensaje de la sesión; en los siguientes, abrirla si Angel la pide.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), preguntar qué estilo usar. Recomendar de uno a tres según la historia de Angel y ofrecer «Otro estilo» para describirlo en palabras.
3. **Recurso.** Si el estilo tiene recurso listo, usarlo (instalarlo antes con la aprobación de Angel si falta). Si tiene prompt base, completar sus variables con la historia de Angel. Para un estilo IA, completar su plantilla de la biblioteca de prompts y entregarla junto con la imagen de partida que pide.
4. **Vista previa.** Renderizar una versión corta y mostrarla antes del render final.
5. **Aprendizaje.** Si Angel cuenta por qué eligió o descartó un estilo, ofrecer guardarlo como criterio en `produccion-video`.

## Los estilos con código

| # | Estilo | Qué se ve | Uso posible |
| --- | --- | --- | --- |
| 01 | Globe arcs | Globo de puntos que gira; arcos de luz salen de una ciudad y un contador sube | Alcance geográfico, envíos, clientes por país |
| 02 | Turntable | Producto girando 360° sobre una base, con especificaciones que aparecen una a una | Ficha de producto, lanzamiento |
| 03 | Hologram | Instalación isométrica en azul translúcido; un módulo se enciende en rojo | Infraestructura, procesos, alertas |
| 04 | Flat cartoon | Personaje 2D plano en oficina; la gráfica cae y vuelan notas | Historias de negocio con humor |
| 05 | 3D map route | Ciudad blanca isométrica; la cámara sigue una ruta azul que se dibuja | Recorridos, logística, entregas |
| 06 | Billboard | Valla en autopista nocturna con estelas de luz; el anuncio cambia | Maquetas de publicidad exterior |
| 07 | Ink doodle | Muñeco dibujado a mano en un parque; viento, papeles y gestos de tinta | Historias cotidianas, antes y después |
| 08 | Glow world | Cristal facetado que brilla en un mundo low poly espacial; aparece una cara y una etiqueta | Mascota o concepto de IA |
| 09 | 3D teardown | Teclado que se despieza capa por capa con etiquetas técnicas | Anatomía de producto |
| 10 | Iceberg dive | La cámara baja bajo el agua y revela capas etiquetadas de un iceberg | Lo visible y lo oculto de un proceso |
| 11 | Documental de archivo | Fotos de archivo generadas, personas de espaldas, zoom lento, grano y subtítulo serif sincronizado con la voz | Historias reales: origen de un producto, un personaje, un momento de la historia |
| 12 | Collage documental | Mesa de edición con fotos reales rasgadas, papel, marcador y cifras en acento lima, a 12 cuadros | Explicar cualquier tema con material real y producción completa |

## Cómo conseguir cada estilo

Investigación del 2026-11-25. Claude Code produce estas animaciones escribiendo código que dibuja cada cuadro (three.js para 3D, GSAP o Remotion para 2D) y grabándolo a MP4 con un navegador sin ventana. Siete de los diez primeros estilos ya tienen una skill o un estilo listo en repositorios públicos; los otros tres se arman con el prompt base de más abajo. El estilo 11 sigue su sub-skill en produccion-video y el 12 la skill local `videos-alfonso-vox`.

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
| 11 | Documental de archivo | Sub-skill `produccion-video/sub-skills/reel-documental-vox.md` (siete prompts); en Claude Code, la skill `vox-explainer` de skills-angel renderiza el MP4 | «Reel documental de archivo sobre…» |
| 12 | Collage documental | Skill `videos-alfonso-vox`, local del Mac (HyperFrames) | «Video collage estilo Vox sobre…» |

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

## Estilos con IA de video desde una imagen

Se generan con Seedance 2.5 en modo imagen a video (el autor original usa Picsart Flow). Las plantillas viven en `plugins/cerebro/skills/prompts/biblioteca/video-estilos-animacion-artesanal.md`, marcadas «por probar».

| # | Estilo | Qué se ve | Uso posible |
| --- | --- | --- | --- |
| IA-01 | Van Gogh Oil | Óleo empastado; cada pincelada y el cielo en remolino se mueven | Retratos, homenajes, piezas emotivas |
| IA-02 | Ink Wash | Tinta china sobre papel de arroz que respira | Historias tranquilas, naturaleza |
| IA-03 | Surreal Cut-Out | Recorte de papel de los 70 con plumilla, movimiento lento | Ideas raras, ciencia ficción |
| IA-04 | Rotoscope | Movimiento real calcado con contornos que tiemblan | Escenas cotidianas con tono de sueño |
| IA-05 | Manuscript | Nudos celtas que crecen y pan de oro | Mitos, marcas con herencia |
| IA-06 | Comic 3D | Semitono, impresión corrida, 12 fps y cuadros de impacto | Acción, deportes |
| IA-07 | Needle Felt | Stop-motion de lana en set macro | Ternura, productos artesanales |
| IA-08 | Colored Pencil | Lápiz de color con grano de papel que titila | Recuerdos, mensajes cálidos |

## Fuente

[viashaan · 10 Claude Animation styles](https://www.instagram.com/p/DgGaMp_DCp4/) · Instagram · guardado el 2026-11-25. Las muestras de `muestras/` son fragmentos de 1,25 s de ese reel, con crédito a su autor. Selector pedido por Angel el 2026-11-25.

Estilo 11: [reel de Beethoven de @naometzger, publicado por @godofprompt](https://www.instagram.com/p/DfTJ6ixCFTe/) · Instagram · guardado el 2026-11-25. La muestra `muestras/11.gif` es un fragmento de 1,25 s, con crédito a su autora.

Estilo 12: la muestra `muestras/12.gif` sale del storyboard de ejemplo de la skill `videos-alfonso-vox` (tema: precio del chocolate). Angel eligió el 2026-11-25 mostrar los dos estilos documentales lado a lado.

Estilos IA: [ai.withphil · 8 hand-animated cartoon styles](https://www.instagram.com/p/Df68uJLCHBX/) · Instagram · guardado el 2026-11-25. Las muestras `muestras/ia-0N.gif` son fragmentos de 1,25 s de ese carrusel, con crédito a su autor. Angel pidió sumarlos como sección aparte el 2026-11-25.
