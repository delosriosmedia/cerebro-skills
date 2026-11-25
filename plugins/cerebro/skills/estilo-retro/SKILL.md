---
name: estilo-retro
description: Úsala cuando Angel diseñe una interfaz visual (app, web, panel, landing, componente) y elija la opción «Estilo retro» que sugiere el hook. Muestra la galería de dieciséis estilos retro, pregunta cuál usar y la convierte en brief para la skill dueña del estilo, con comportamientos accesibles de UI SDK.
---

# Estilo retro para interfaces

Interfaces con la personalidad de los aparatos, sistemas, juegos e impresos de los 80, 90 y 2000: reproductores con skin, equipos con perillas, ventanas clásicas, terminales de fósforo, arcade, casetes y fanzines. La estética es retro; el comportamiento (teclado, foco, lectores de pantalla) es actual.

Esta skill es una alternativa que Angel marca o deja pasar. Cuando la marca, define la dirección de arte y se la entrega como brief a la skill que construye.

## Cuándo se activa

- El hook `hooks/sugerir-estilo-retro.sh` del plugin detecta que Angel va a diseñar o construir una interfaz visual y le pide a Claude sumar «Estilo retro» como una opción más en la pregunta de estilo. Un aviso por sesión.
- Angel escribe «retro», «Y2K», «2000», «Winamp», «aparato», «consola», «arcade» o «nostálgico» al pedir una interfaz.
- Si Angel no elige la opción, Claude sigue con su flujo habitual sin volver a mencionarla.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta (`open <ruta>/galeria.html` en el Mac). Muestra los dieciséis estilos dibujados en vivo, en cuatro grupos.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), preguntar qué estilo usar. Recomendar de uno a tres según el producto (tabla de abajo) y ofrecer «Mezcla de dos» y «Sin retro».
3. **Brief.** Escribir el brief del estilo elegido (sección «Brief para el dueño») y entregarlo a la skill dueña del estilo:
   - Todos los estilos salvo el 10: `impeccable`. Un brief explícito libera lo que esa skill solo evita por defecto (biseles, texturas, tipografía mono).
   - Estilo 10 (Arcade): el tema «Arcade» de `hallmark` (`references/themes/arcade.md`), que ya trae esa estética resuelta.
   - Si el proyecto ya declaró dueño (`Diseño web: dueño del estilo = …` en su CLAUDE.md), el brief va a ese dueño.
4. **Comportamiento.** Cada control a medida (perilla, rueda, selector de fecha, lista tipo playlist, menú contextual) se arma sobre primitivas accesibles. En proyectos React, Vue, Svelte, Solid o Web Components, proponer UI SDK de Vercel Labs (`npm install @ui-sdk/core @ui-sdk/<framework>` y su skill `npx skills add vercel-labs/ui --skill ui-sdk`) y seguir `design-engineering`: `references/meta/ui-sdk-reconciliation.md` y `references/components/component-behavior-spec.md`. La perilla es un `slider` con flechas, Inicio y Fin; la rueda de fecha, un `spinbutton`.
5. **Revisión.** Antes de entregar, pasar la lista «Retro que se lee» y mostrar una captura a Angel.

## Los dieciséis estilos

La galería los muestra en cuatro grupos, cada uno dibujado en vivo.

| # | Estilo | Cómo se ve | Ideal para |
| --- | --- | --- | --- |
| 01 | Skin Y2K | Carcasa metálica con biseles, LCD azul con texto que corre, ecualizador, botones con relieve | Reproductores, herramientas creativas, páginas de producto nostálgicas |
| 02 | Aparato | Carcasa clara mate, LCD negra con cifras en rojo, perillas y botones físicos, rótulos mono | Paneles, configuradores, apps de audio o domótica, landings de hardware o SaaS |
| 03 | Consola portátil | Cruceta, botón rojo y pantalla oscura con gráficas y registros | Paneles de control, despliegues, herramientas internas con humor |
| 04 | LCD de 7 segmentos | Pantalla verde grisácea de calculadora o reloj, cifras inclinadas, teclas de goma | Calculadoras, cotizadores, contadores, temporizadores, métricas grandes |
| 05 | Escritorio clásico | Ventanas grises con biseles, barra de título azul, foco punteado | Portafolios lúdicos, herramientas internas, campañas con humor |
| 06 | Mac clásico 1 bit | Blanco y negro puro, barra de título rayada, sombras duras, tramas | Blogs personales, portafolios de diseño, herramientas de escritura |
| 07 | Aqua | Botones de gel, rayas finas, semáforos con reflejo, progreso animado | Apps de escritorio, instaladores, configuración, productos para creativos |
| 08 | Frutiger Aero | Cielo azul, pasto verde, burbujas, paneles de vidrio brillante | Bienestar, ecología, nube, servicios con tono optimista |
| 09 | Terminal de fósforo | Texto verde o ámbar con brillo sobre negro, líneas de barrido, todo mono | Herramientas de desarrollo, registros, consolas de comandos |
| 10 | Arcade | Fondo oscuro, títulos con desfase RGB, sombras duras, neón | Juegos, eventos, hackatones, lanzamientos ruidosos |
| 11 | RPG de 8 bits | Escenario de cuadritos, corazones de vida, caja de diálogo con menú de flecha | Onboarding, gamificación, logros, tutoriales |
| 12 | Vaporwave | Atardecer magenta, sol rayado, cuadrícula de neón en perspectiva | Música, moda, eventos nocturnos, landings de campaña |
| 13 | Muestrario de papelería | Bloques de color sólido con nombre en serif y número de catálogo | Selectores de color o variante, catálogos, tiendas, marcas editoriales |
| 14 | Web de los 90 | Fondo con estrellas, texto que corre, cinta «en construcción», contador | Humor, fan sites, eventos temáticos, portafolios irreverentes |
| 15 | Casete | Etiqueta escrita a mano con franjas, carretes que giran | Listas de reproducción, podcasts, notas de voz |
| 16 | Fanzine fotocopiado | Fotocopia en blanco y negro, recortes con cinta, titulares torcidos | Música independiente, eventos, colectivos, portafolios con actitud |

## Brief para el dueño

Plantilla que Claude completa y pega en el chat antes de construir:

```text
Dirección de arte: <estilo de la galería>, con su época y referencia.
Materiales: <carcasa, pantalla, papel o relieve propios del estilo>.
Tipografía: <mono pequeña para rótulos y cifras + sans para el texto largo>.
Color: <base neutra de la carcasa + un acento propio de la pantalla (rojo LCD, azul LCD, verde fósforo)>.
Controles físicos: <qué acciones toman forma de perilla, rueda, botón o interruptor>.
Movimiento: respuesta mecánica corta (clic, giro, encendido de pantalla), 150 a 300 ms, con versión reducida.
Se mantiene: jerarquía clara, texto largo legible, contraste AA, comportamiento accesible.
```

## Retro que se lee

| Revisión | Medida |
| --- | --- |
| Contraste del texto sobre LCD, fósforo o carcasa | 4,5:1 en texto normal, 3:1 en texto grande y en bordes de controles |
| Texto largo | En sans legible; la mono y la pixel quedan para rótulos, cifras y títulos |
| Tamaño de los controles físicos | 44 px de área táctil como mínimo, aunque el dibujo sea más pequeño |
| Líneas de barrido, parpadeo y texto que corre | Se apagan con `prefers-reduced-motion`; sin parpadeos de más de 3 por segundo |
| Perillas y ruedas | Funcionan con teclado y anuncian su valor (`aria-valuenow`, `aria-valuetext`) |
| Densidad | Un aparato por pantalla como protagonista; el resto de la interfaz acompaña |

## Relación con otras skills

| Skill | Relación |
| --- | --- |
| `impeccable` | Dueña habitual: construye con el brief retro |
| `hallmark` | Su tema «Arcade» resuelve el estilo 10 |
| `design-engineering` | Integración y comportamiento de UI SDK; controles a medida |
| `diseno-web` | Elige al dueño; esta skill le suma la dirección de arte |
| `ux-ui` (cerebro) | Sus criterios siguen aplicando sobre el estilo elegido |

## Fuente

[Reel de Instagram](https://www.instagram.com/reel/Df3GvclOcTG/) guardado el 2026-11-25: interfaces con estética de los 2000 hechas sobre UI SDK de Vercel Labs, como respuesta al diseño genérico de los componentes prehechos.
