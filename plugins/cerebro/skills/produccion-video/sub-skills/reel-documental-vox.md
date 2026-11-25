# Reel documental estilo Vox con IA

Un reel vertical de 45 a 60 segundos con aspecto de documental de archivo, hecho desde una sola frase de tema. Claude escribe y verifica, Gemini (Nano Banana) pinta las escenas, Angel graba la voz y un reproductor HTML hecho por Claude anima todo. El orden de los pasos sostiene la calidad: primero el estilo y los hechos, después las escenas, y al final se arregla una sola escena floja.

## Cuándo usar

- Angel pide un reel o explicativo documental sobre una historia: el origen de un producto, por qué algo cuesta lo que cuesta, un momento de la historia de su sector o un personaje.
- Angel elige «Documental de archivo» en la galería de `selector-animacion`.
- Hace falta una pieza rápida, desde el celular o la nube, con imágenes generadas y sin editor de video.

## Material

| Pieza | Herramienta |
| --- | --- |
| Ángulo, hechos, guion, escenas y reproductor | Claude (una sola conversación para todo) |
| Imágenes 9:16 | Gemini con Nano Banana, una escena por mensaje |
| Voz | Grabación en el celular (leer dos veces, quedarse con la segunda toma) |
| Video final | Grabación de pantalla del reproductor, o render a MP4 en Claude Code |

## Reglas que sostienen el estilo

1. **Cinco reglas de estilo fijas** para todas las imágenes: paleta, textura, tipo de imagen (foto de archivo, papel, mapa), tipografía y un elemento visual que se repite.
2. **La escena 1 es la referencia.** Cada prompt de imagen siguiente empieza con «Usa el estilo de la imagen de referencia».
3. **Personas reales solo de espaldas o en silueta.** Los modelos de imagen rechazan rostros reales, y la silueta además le da al reel su tono de archivo.
4. **Cada frase del guion es verificable.** Claude lista cada dato con su fuente antes de escribir; lo que no se puede verificar se corta.
5. **El dato más sorprendente va en los primeros 2 segundos** y el cierre es una frase que la gente repite.
6. **Sin texto dentro de las imágenes.** El texto lo pone el reproductor, sincronizado con la voz.

## Pasos

Cada paso es un prompt para la misma conversación. Las variables van entre llaves.

### 1 · Historia y reglas de estilo

```text
Quiero un reel documental de 45 segundos estilo Vox, vertical, sobre {tema: cómo nació mi producto / un momento de la historia / por qué X cuesta lo que cuesta}.
Antes de escribir, dame 3 ángulos, cada uno con un gancho de una línea y el dato más sorprendente, y elige uno para gente que nunca ha oído de mí. Nombra un video de Vox del que copiamos el ritmo.
Después, 5 reglas de estilo visual que mantenemos en cada imagen: paleta, textura, tipo de imagen (foto de archivo, papel, mapa), tipografía y un elemento visual que se repite.
```

### 2 · Hechos primero, guion después

```text
Toma el ángulo {N}. Primero lista cada afirmación de hecho que vamos a hacer, con una fuente para cada una (usa búsqueda), y marca lo que no puedas verificar: eso se corta.
Después escribe el guion: de 45 a 60 segundos leído en voz alta, de 110 a 140 palabras, frases cortas, tiempo presente, una idea por frase.
El dato más sorprendente en los primeros 2 segundos. Cierra con una frase que la gente repita. Marca [pausa] donde la imagen deba respirar.
```

### 3 · Guion gráfico

```text
Divide el guion en 8 a 10 escenas. Para cada una: número, las palabras exactas que cubre, duración en segundos, qué se ve en pantalla en una línea y un prompt de imagen para Gemini que siga nuestras 5 reglas de estilo al pie de la letra: sujeto, encuadre, luz, textura, 9:16, sin texto en la imagen.
Personas reales solo de espaldas o en silueta: los modelos de imagen rechazan rostros.
El prompt de la escena 1 es la referencia. Todos los demás empiezan con «Usa el estilo de la imagen de referencia». Formato de tabla.
```

### 4 · Imágenes en Gemini, una por mensaje

Pegar en Gemini (Nano Banana) el prompt de la escena 1. Luego, un mensaje por escena:

```text
Usando la primera imagen como referencia de estilo, haz la escena {N}: {prompt de la escena}. Misma paleta, misma textura, mismo grano, 9:16, sin texto. Si algo no coincide con la referencia, corrígelo antes de mostrármelo.
```

Si una imagen se desvía:

```text
Más cerca de la referencia: la misma textura de papel y los mismos dos colores; cambia solo el sujeto.
```

### 5 · Pauta de locución

```text
Escribe la locución como la voy a leer, línea por línea, con el número de escena al lado de cada línea y los segundos que debe durar. Agrega marcas de respiración, dime las 3 palabras que debo enfatizar y los 2 lugares donde debo bajar el ritmo.
Después, una versión de 20 segundos por si la completa queda larga. Texto plano, sin acotaciones que yo terminaría leyendo en voz alta.
```

Grabar en el celular, leer dos veces y quedarse con la segunda toma.

### 6 · El reproductor

```text
Construye una página HTML como artifact: una zona para soltar mis imágenes de escena en orden y mi archivo de voz, y un solo botón de reproducir.
Reproduce un escenario 9:16 centrado sobre negro: cada imagen dura lo que dice el guion gráfico, con un zoom o desplazamiento lento, fundidos de 0,4 segundos entre escenas, la línea de cada escena como subtítulo grande con tipografía serif que aparece con la voz, y grano de película suave.
Deja fijos los tiempos y los subtítulos. Si mi grabación dura más, estira todas las escenas para que coincidan. Voy a grabar la pantalla.
```

### 7 · Arreglar la escena floja y exportar

```text
La escena {N} se siente plana. Dame 3 arreglos: un prompt nuevo para Gemini que respete nuestras reglas de estilo, un subtítulo más corto y un movimiento de cámara distinto.
Después, la lista de exportación: grabar el artifact a pantalla completa, recortar el primer segundo, revisar que los subtítulos se lean en un celular y escribir 3 textos para publicarlo, con una línea que acredite las fuentes del paso 2.
```

Cada primer corte tiene una escena floja: se arregla esa, las demás se quedan.

## En Claude Code

El mismo flujo corre en Claude Code con dos cambios:

- **Paso 4:** las imágenes se generan con la API de Gemini (`GEMINI_API_KEY`), pasando la imagen de la escena 1 como referencia en cada llamada.
- **Pasos 6 y 7:** el reproductor se guarda como `reproductor.html` con las imágenes y la voz en la misma carpeta, se graba con Playwright a 1080×1920 y 30 fps, y ffmpeg une el video con la voz en un MP4 listo para subir. La skill `vox-explainer` de skills-angel trae ese montaje.

## Verificación

- Cada dato del guion tiene su fuente en la lista del paso 2.
- Las 8 a 10 imágenes comparten paleta, textura y grano con la escena 1.
- Ninguna imagen muestra el rostro de una persona real ni trae texto.
- Los subtítulos caen con la voz y se leen en la pantalla de un celular.
- El texto de publicación acredita las fuentes.

## Fuente

[@godofprompt · reel de @naometzger sobre Beethoven](https://www.instagram.com/p/DfTJ6ixCFTe/) · Instagram · guardado el 2026-11-25. Prompts traducidos y adaptados al español.
