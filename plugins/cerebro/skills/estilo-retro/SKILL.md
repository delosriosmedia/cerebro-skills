---
name: estilo-retro
description: Úsala cuando Angel diseñe una interfaz visual (app, web, panel, landing, componente) y elija la opción «Estilo retro» que sugiere el hook. Muestra la galería de cuatro variantes retro, pregunta cuál usar y la convierte en brief para la skill dueña del estilo, con comportamientos accesibles de UI SDK.
---

# Estilo retro para interfaces

Interfaces con la personalidad de los aparatos y programas de los 2000: reproductores con skin, equipos con perillas y pantallas LCD, terminales de fósforo y máquinas arcade. La estética es retro; el comportamiento (teclado, foco, lectores de pantalla) es actual.

Esta skill es una alternativa que Angel marca o deja pasar. Cuando la marca, define la dirección de arte y se la entrega como brief a la skill que construye.

## Cuándo se activa

- El hook `hooks/sugerir-estilo-retro.sh` del plugin detecta que Angel va a diseñar o construir una interfaz visual y le pide a Claude sumar «Estilo retro» como una opción más en la pregunta de estilo. Un aviso por sesión.
- Angel escribe «retro», «Y2K», «2000», «Winamp», «aparato», «consola», «arcade» o «nostálgico» al pedir una interfaz.
- Si Angel no elige la opción, Claude sigue con su flujo habitual sin volver a mencionarla.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta (`open <ruta>/galeria.html` en el Mac). Muestra cada variante dibujada en vivo.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), preguntar qué variante usar. Recomendar una según el producto (tabla de abajo) y ofrecer «Mezcla de dos» y «Sin retro».
3. **Brief.** Escribir el brief de la variante elegida (sección «Brief para el dueño») y entregarlo a la skill dueña del estilo:
   - Variantes 1, 2 y 3: `impeccable`. Un brief explícito libera lo que esa skill solo evita por defecto (biseles, texturas, tipografía mono).
   - Variante 4: el tema «Arcade» de `hallmark` (`references/themes/arcade.md`), que ya trae esa estética resuelta.
   - Si el proyecto ya declaró dueño (`Diseño web: dueño del estilo = …` en su CLAUDE.md), el brief va a ese dueño.
4. **Comportamiento.** Cada control a medida (perilla, rueda, selector de fecha, lista tipo playlist, menú contextual) se arma sobre primitivas accesibles. En proyectos React, Vue, Svelte, Solid o Web Components, proponer UI SDK de Vercel Labs (`npm install @ui-sdk/core @ui-sdk/<framework>` y su skill `npx skills add vercel-labs/ui --skill ui-sdk`) y seguir `design-engineering`: `references/meta/ui-sdk-reconciliation.md` y `references/components/component-behavior-spec.md`. La perilla es un `slider` con flechas, Inicio y Fin; la rueda de fecha, un `spinbutton`.
5. **Revisión.** Antes de entregar, pasar la lista «Retro que se lee» y mostrar una captura a Angel.

## Las cuatro variantes

| # | Variante | Cómo se ve | Ideal para |
| --- | --- | --- | --- |
| 1 | Skin Y2K | Carcasa metálica con biseles, pantalla LCD azul con texto que corre, ecualizador de barras, botones con relieve | Reproductores, herramientas creativas, páginas de producto con guiño nostálgico |
| 2 | Aparato | Carcasa clara mate, pantalla LCD negra con cifras en rojo, perillas y botones físicos, rótulos mono pequeños | Paneles, configuradores, apps de audio o domótica, landings de hardware o SaaS con carácter |
| 3 | Terminal de fósforo | Fondo casi negro, texto verde o ámbar con brillo, líneas de barrido, todo en mono | Herramientas para desarrolladores, registros, paneles de despliegue, consolas de comandos |
| 4 | Arcade | Fondo oscuro, títulos pixel con desfase RGB, sombras duras, colores de neón | Juegos, eventos, hackatones, lanzamientos ruidosos |

## Brief para el dueño

Plantilla que Claude completa y pega en el chat antes de construir:

```text
Dirección de arte: <variante>, estética de aparato o programa de los 2000.
Materiales: <carcasa / pantalla / relieve propios de la variante>.
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
| `hallmark` | Su tema «Arcade» resuelve la variante 4 |
| `design-engineering` | Integración y comportamiento de UI SDK; controles a medida |
| `diseno-web` | Elige al dueño; esta skill le suma la dirección de arte |
| `ux-ui` (cerebro) | Sus criterios siguen aplicando sobre la variante elegida |

## Fuente

[Reel de Instagram](https://www.instagram.com/reel/Df3GvclOcTG/) guardado el 2026-11-25: interfaces con estética de los 2000 hechas sobre UI SDK de Vercel Labs, como respuesta al diseño genérico de los componentes prehechos.
