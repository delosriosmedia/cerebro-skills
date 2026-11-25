# Estilos de animación artesanal desde una imagen fija

## Para qué sirve

Convierte una imagen fija en un clip corto que parece animado a mano. Hay ocho estilos: óleo empastado, tinta china, recorte surrealista de los 70, rotoscopia, manuscrito celta, cómic 3D, fieltro en stop-motion y lápiz de color. Cada clip dura unos 6 segundos, cuenta una mini historia con su propio sonido y cierra en un cuadro final limpio, listo para un reel.

Estado: **por probar.** El autor del carrusel entrega sus prompts originales solo por mensaje directo. Estas plantillas las redactó Claude con lo que muestra cada clip y con las pistas públicas citadas en cada estilo.

La galería de `selector-animacion` muestra cada estilo en movimiento (tarjetas IA-01 a IA-08).

## Cómo usarlas

1. **Imagen de partida.** Crea o elige una imagen fija que ya tenga el estilo (personaje, escenario y textura). Las guías coinciden: el modelo mantiene mejor el estilo cuando la imagen ya lo trae.
2. **Modo imagen a video.** Sube la imagen como primer cuadro y pega el prompt del estilo con sus variables completas.
3. **Estilo explícito.** El prompt nombra la técnica y la textura en la primera línea y las repite en la última; sin esa indicación, Seedance tiende a volver a la imagen realista.
4. **Orden del prompt:** estilo, sujeto, acción en el tiempo, escenario, cámara, sonido y cuadro final.
5. **Una sola acción principal** por clip de 6 s, con causa y efecto: qué mueve qué y cómo queda al terminar.

## Variables a reemplazar

| Variable | Qué significa | Ejemplo |
| --- | --- | --- |
| `{sujeto}` | Personaje o elemento principal de la imagen | un ciclista con gorra |
| `{accion}` | Lo que hace durante el clip, de principio a fin | levanta la gorra hacia el cielo y sonríe a cámara |
| `{escenario}` | Dónde ocurre | un campo de trigo de noche |
| `{sonido}` | Ambiente y efectos | viento suave, campanilla de bicicleta |
| `{cuadro_final}` | Cómo queda la imagen en el último segundo | el ciclista quieto, mirando a cámara |
| `{formato}` | Relación de aspecto | 3:4 vertical |

## Prompts

### IA-01 · Van Gogh Oil (empaste grueso, cielo en remolino)

```text
Hand-painted oil animation in the style of Van Gogh: thick impasto, visible directional brushstrokes, swirling blue and yellow sky.
Start from the provided image. {sujeto} {accion}, in {escenario}.
Every brushstroke boils gently frame to frame; the sky swirls slowly like wet, thick paint; the paint texture stays on every surface, including skin and clothes.
Camera: locked-off, slight slow push-in. Duration 6 s, {formato}.
Sound: {sonido}.
End on a clean, still final frame: {cuadro_final}.
Entirely painted look, oil on canvas texture throughout.
```

Pista pública: [YouMind · Van Gogh Post-Impressionism Abstract Animation](https://youmind.com/video-prompts/van-gogh-post-impressionism-abstract-animation-prompt-77) (empaste, remolinos, contraste azul y amarillo).

### IA-02 · Ink Wash (tinta china, papel de arroz, años 60)

```text
1960s Chinese ink wash animation on rice paper: black and grey sumi ink, soft wet edges, visible paper fibres, generous empty space.
Start from the provided image. {sujeto} {accion}, in {escenario}.
The brushstrokes breathe into the rice paper: ink bleeds softly at the edges as things move; mist and background mountains are pale washes.
Camera: locked-off, gentle lateral drift. Duration 6 s, {formato}.
Sound: {sonido}, with a traditional bamboo flute.
End on a clean, still final frame: {cuadro_final}.
Hand-brushed ink on rice paper throughout.
```

Pista pública: [YouMind · Chinese Shan Shui Ink Wash Animation](https://youmind.com/video-prompts/chinese-ink-painting-landscape-animation-7324) (pincelada negra sobre papel de arroz, manchas que se expanden).

### IA-03 · Surreal Cut-Out (ciencia ficción de los 70, plumilla)

```text
1970s surreal sci-fi cut-out animation: flat paper cut-out characters with visible paper joints, fine pen hatching, muted blue, ochre and red palette, strange organic landscape.
Start from the provided image. {sujeto} {accion}, in {escenario}.
Movement is slow and hypnotic: limbs rotate at their paper joints, petals and creatures open in stepped motion, about 12 drawings per second.
Camera: locked-off. Duration 6 s, {formato}.
Sound: {sonido}, with a dreamy analog synthesizer drone.
End on a clean, still final frame: {cuadro_final}.
Hand-drawn, hand-cut paper look throughout.
```

Pista pública: [cdance · Surreal Collage Animation Prompt](https://cdance.net/prompts/seedance-2-0/surreal-collage-animation-prompt) (recorte de papel en Seedance; aquí el ritmo es lento).

### IA-04 · Rotoscope (acción real calcada, formas planas)

```text
Rotoscope animation: hand-drawn over filmed live action, wobbling ink outlines, flat colour fills in a limited palette that shifts slightly between frames.
Start from the provided image. {sujeto} {accion}, in {escenario}.
Motion stays fully realistic while every figure reads as a drawing; contour lines boil and waver gently; rain and reflections are flat painted shapes.
Camera: slow handheld drift. Duration 6 s, {formato}.
Sound: {sonido}.
End on a clean, still final frame: {cuadro_final}.
Traced, hand-drawn look throughout.
```

Pista pública: [PromptJazz · Rotoscope animation](https://promptjazz.com/prompts/visual-styles/rotoscope/) (contornos que tiemblan, rellenos planos, paleta corta).

### IA-05 · Manuscript (nudos celtas, pan de oro)

```text
Illuminated medieval manuscript animation: Celtic knotwork borders, gold leaf that catches the light, rich green, red and ochre pigments on aged vellum.
Start from the provided image. {sujeto} {accion}, in {escenario}.
The knotwork grows like vines along the border; drawn figures come to life inside the page with gentle, flat 2D motion; gold leaf shimmers as it moves.
Camera: locked-off, slight push-in on the page. Duration 6 s, {formato}.
Sound: {sonido}, quill scratching on parchment.
End on a clean, still final frame: {cuadro_final}.
Hand-illuminated manuscript look throughout.
```

Pista pública: estilo Book of Kells para imagen ([Oomol · Book of Kells](https://prompts.oomol.com/p/book-kells-restoration-comparison-28940)); el movimiento lo redactó Claude.

### IA-06 · Comic 3D (puntos de semitono, impresión corrida, 12 fps)

```text
Stylized 3D animation rendered as a printed comic: bold ink outlines, halftone dot shading, slightly misregistered colour plates, animated on twos at 12 fps.
Start from the provided image. {sujeto} {accion}, in {escenario}.
Action peaks with comic impact frames and speed lines; the halftone dots stay locked to the surfaces as they move.
Camera: dynamic low angle, quick push on the impact. Duration 6 s, {formato}.
Sound: {sonido}, with a punchy hit on the impact frame.
End on a clean, still final frame: {cuadro_final}.
Printed comic book texture throughout.
```

Pista pública: [Awesome Claude · Claude Motion Graphics](https://awesomeclaude.ai/claude-motion-graphics) (semitono con movimiento escalonado a 12 fps y placas de color desplazadas).

### IA-07 · Needle Felt (stop-motion de lana, set macro)

```text
Needle-felt wool stop-motion animation on a miniature macro set: visible wool fibres, handmade felt props, shallow depth of field, soft warm practical lighting.
Start from the provided image. {sujeto} {accion}, in {escenario}.
Animated in stop-motion steps; wool fibres shimmer frame by frame; tiny handmade imperfections stay visible.
Camera: macro lens, slow motion-control slide. Duration 6 s, {formato}.
Sound: {sonido}, soft foley of small footsteps on felt.
End on a clean, still final frame: {cuadro_final}.
Entirely handmade felt and wool throughout.
```

Pistas públicas: [film.fun · Needle-Felt Stop Motion](https://www.film.fun/templates/needle-felt-stop-motion-moon-fishing) y [Magnific · Seedance 2.5 animation prompts](https://www.magnific.com/blog/seedance-2-5-animation-prompts/) (lente macro, poca profundidad de campo, todo hecho a mano).

### IA-08 · Colored Pencil (crayón suave, grano de papel)

```text
Coloured pencil animation: soft crayon strokes, visible paper grain, light cross-hatching, gentle pastel palette.
Start from the provided image. {sujeto} {accion}, in {escenario}.
The hatching flickers softly frame to frame like redrawn pencil; wind moves grass and fabric with loose pencil strokes.
Camera: locked-off, slight upward tilt. Duration 6 s, {formato}.
Sound: {sonido}.
End on a clean, still final frame: {cuadro_final}.
Hand-drawn coloured pencil on paper throughout.
```

Pista pública: sin prompt público específico; redactado por Claude con lo que muestra el clip.

## Herramienta o modelo recomendado

Seedance 2.5 en modo imagen a video. El carrusel original usa Picsart Flow, que permite elegir el modelo en cada nodo; Seedance también está disponible en otras plataformas.

## Fuente

[@ai.withphil · 8 hand-animated cartoon styles](https://www.instagram.com/p/Df68uJLCHBX/) · Instagram · guardado el 2026-11-25. El texto del post menciona un noveno estilo, arena («una ola se convierte en ballena»), sin clip en el carrusel. Pistas públicas por estilo citadas arriba.
