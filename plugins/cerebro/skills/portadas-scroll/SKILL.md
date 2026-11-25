---
name: portadas-scroll
description: Úsala cuando Angel diseñe la portada de un carrusel, la primera imagen de un post o la miniatura de un video para redes. Muestra la galería de diez técnicas de portada con su psicología (incongruencia, mirada, cifra exacta, tachado, disfraz, antes y después, corte en el borde, raro entre iguales, palabra que actúa, pregunta A o B), pregunta cuáles usar y las aplica (carousel cover, thumbnail, scroll stopper).
---

# Portadas que frenan el scroll

Un post tiene cerca de 1,7 segundos en el feed del teléfono (Facebook IQ, 2016). La portada decide si alguien se detiene. Esta skill reúne diez técnicas de portada, cada una con el truco visual y la razón psicológica que la hace funcionar, muestra la galería y aplica la que Angel elija.

## Cuándo se activa

- Angel diseña la portada de un carrusel, la primera imagen de un post, la miniatura de un reel o de YouTube, o pide que una pieza «frene el scroll».
- El hook `hooks/sugerir-portadas.sh` del plugin detecta esos pedidos, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer mensaje de la sesión.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion, varias opciones permitidas), preguntar qué técnicas usar. Recomendar una o dos según el tema y el material disponible (hay foto de una persona, hay un dato, hay un antes y después). Dos técnicas combinadas suman; tres compiten.
3. **Diseño.** Aplicar la técnica elegida con la receta de la tabla. La jerarquía, la ruta del ojo y el espacio los decide `composicion-grafica`; el color, `experto-color` (regla 60-30-10, C-001 de `diseno-grafico/criterios/color.md`); el texto, `selector-redaccion` si Angel quiere pulirlo.
4. **Prueba del segundo y medio.** Ver la portada al tamaño de la cuadrícula del perfil (unos 360 px de ancho) durante un segundo y medio. Debe leerse el gancho y notarse el truco. Si hace falta acercarse, simplificar.
5. **Promesa cumplida.** Lo que la portada promete (una cifra, una corrección, un después) aparece completo dentro del carrusel o del video.

## Las diez técnicas

| # | Técnica | Receta | Por qué funciona | Fuente o ejemplo |
| --- | --- | --- | --- | --- |
| 01 | Foto con trazo | Una foto real cruzada por trazos a mano: una línea de lápiz, una cifra escrita, una mano dibujada | Incongruencia: ni anuncio ni garabato, el cerebro mira dos veces | Anuncio de laddoo de Cashfree |
| 02 | La mirada | Un rostro de perfil cuya mirada apunta al titular | Seguimos la mirada ajena; un rostro que mira al producto subió el recuerdo de 1,06 a 1,50 | Sajjacholapunt y Ball, 2014 |
| 03 | La cifra exacta | Un número impar y exacto que ocupa media portada, con su explicación debajo | Lo preciso se lee como medido; lo redondo, como cálculo a ojo | Thomas, Simon y Kadiyali, 2010 · cartel «Sorry 42 times» de Spotify |
| 04 | Tachado en rojo | Una creencia popular tachada y la corrección escrita encima en rojo, sobre papel rayado | Una palabra tachada rompe una predicción y el cerebro busca el arreglo | Carteles «Strikethrough» de Productboard |
| 05 | El disfraz | La portada imita la pantalla de bloqueo con notificaciones; el gancho llega como mensaje, con montos reales | Saltamos los anuncios; la pantalla del propio teléfono la miramos | Benway y Lane, 1998 · «Autocomplete Truth» de ONU Mujeres |
| 06 | Antes y después | Un mismo sujeto partido por un divisor vertical, con la causa nombrada abajo | Lado a lado obliga a comparar; la diferencia es la promesa | «Evolution» de Dove |
| 07 | El corte | Tipografía enorme cortada en el borde derecho y una señal de deslizar | Tendemos a terminar lo que queda cortado; aquí terminar es deslizar | Loewenstein, 1994 · Ghibellini y Meier, 2025 |
| 08 | El raro entre iguales | Una cuadrícula de elementos idénticos y uno distinto; el titular lo nombra | Efecto de aislamiento: lo distinto se ve primero, sin esfuerzo, y se recuerda mejor | von Restorff, 1933 · «Silhouettes» del iPod de Apple |
| 09 | La palabra que actúa | La palabra clave hace lo que dice: «soltar» con letras que caen, «espacio» con letras separadas | El momento «ajá» al descubrir el juego premia la mirada | Texto del carrusel original |
| 10 | A o B | Dos opciones lado a lado y una pregunta directa: «¿A o B?» | Efecto pregunta: una pregunta pide respuesta y abre la conversación | Texto del carrusel original |

Las técnicas 09 y 10 se redactaron desde el texto del post; sus diapositivas quedaron fuera de la captura.

## Relación con otras skills

| Idea | Dónde vive también | Cómo se reparten |
| --- | --- | --- |
| Mirada hacia el texto (02) | `composicion-grafica` (skills-angel), «Señales para guiar el ojo» | `composicion-grafica` la usa para la ruta del ojo en cualquier pieza; aquí es la técnica de portada completa |
| Aislamiento y Von Restorff (08) | `composicion-grafica` (jerarquía por aislamiento) y `auditoria-ux` (`references/leyes.md`, Efecto Von Restorff) | Esas skills la aplican a la jerarquía y a las interfaces; aquí es una portada construida sobre el efecto |
| Cifra exacta en la portada (03) | `social` (skills-angel), `references/carousel-frameworks.md`, portada «Value-Stack» | `social` define la estructura del carrusel completo; aquí está el diseño de la portada |

## Fuente

[Carrusel de Instagram de doagenticly](https://www.instagram.com/p/DfmYi-fj1kv/) guardado el 2026-11-25. Fuentes citadas por el autor: Facebook IQ «Capturing attention in feed» (2016), Sajjacholapunt y Ball (2014), Thomas, Simon y Kadiyali (2010), Benway y Lane (1998), Loewenstein (1994), Ghibellini y Meier (2025), von Restorff (1933). La galería usa maquetas propias.
