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

## Ideas que podría alimentar

- Un criterio en `produccion-video/criterios/ia-video.md` con el menú de estilos para pedir animaciones a Claude Code.
- Prompts propios en `prompts/biblioteca/` para cada estilo, cuando se escriban y prueben.
- La skill `selector-hyperframes`, si estos estilos se reproducen con HyperFrames.

## Relación con el cerebro

Complementa la ficha `repos/tugrawork-creator-saas-motion-kit.md` (101 temas visuales para promos de software): ese kit cubre temas de interfaz y este catálogo cubre estilos narrativos e ilustrados.
