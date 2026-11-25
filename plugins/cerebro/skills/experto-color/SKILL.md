---
name: experto-color
description: Úsala cuando Angel elija, revise o corrija los colores de una pieza gráfica, una interfaz, una marca o una paleta. Mide los colores reales, deja tres, asigna cuál va al 60, al 30 y al 10 según la regla 60-30-10, sugiere qué colores cambiar con psicología del color y propone paletas probadas de la biblioteca (color palette, 60-30-10, color psychology).
---

# Experto en color

Corrige y propone el color de cualquier pieza o interfaz con la regla 60-30-10: tres colores, cada uno con un rol. Mide en lugar de opinar, explica cada cambio con psicología del color y muestra el resultado en barras y maquetas.

## Cuándo se activa

- Angel trabaja una pieza gráfica, una interfaz, un logo con su marca, una presentación o una miniatura y define, cambia o duda de sus colores.
- Angel comparte una paleta, una captura o un archivo con colores y pide revisarlos.
- El hook `hooks/sugerir-color.sh` del plugin lo detecta, abre la galería de paletas una vez por sesión y le recuerda a Claude seguir esta skill.

## La regla

| Rol | Área | Qué hace | Ejemplos |
| --- | --- | --- | --- |
| 60 · dominante | 50 a 70 % | Crea el ambiente y deja descansar la vista | Fondo, lienzo, grandes superficies |
| 30 · secundario | 20 a 40 % | Ordena: separa bloques y lleva el texto | Tarjetas, paneles, titulares, cuerpo de texto |
| 10 · acento | 5 a 15 % | Dirige la mirada a lo importante: es el color más vivo y brillante de la pieza | Llamado a la acción, dato clave, enlace, precio |

Cuenta el acento: aparece en tres elementos por pantalla como máximo; con más, deja de destacar. Un tercer color con el mismo peso que los otros dos abarata la pieza: redúcelo al 10 % o quítalo.

Cómo se cuentan los colores:
- Variantes claras u oscuras del mismo tono cuentan como el mismo color (un azul y su versión al 20 % son un solo rol).
- Los colores de estado (error, éxito, alerta) quedan fuera del conteo y siempre van con icono o texto.
- Las fotos y las ilustraciones quedan fuera de la medición; se mide el diseño que las rodea.
- En apps, tableros y formularios el 60 y el 30 suelen ser neutros (fondo y superficies o texto), y el 10 es el color de marca en acciones y estados seleccionados. Por área, una interfaz clara suele medir 75–85 % de neutro: ahí la regla se juzga por roles, con `--interfaz` (60 hasta 85 %, 30 desde 8 %). Caso medido en [references/ejemplos.md](references/ejemplos.md).
- En marcas: 60 neutro (fondos), 30 el color principal de la marca (titulares, navegación, bloques), 10 el acento de alto contraste.
- Un grupo repetido de acciones iguales (por ejemplo, cuatro botones redondos de la misma fila) cuenta como un solo foco al contar el acento.

Esta regla es la C-001 de `diseno-grafico/criterios/color.md`; esta skill es su procedimiento completo.

## Pasos

1. **Inventario.** Reunir los colores en uso:
   - Imagen, captura o render: `python3 scripts/medir_color.py <imagen>` (con `--recorte x,y,ancho,alto` para dejar fuera fotos o bordes).
   - Paleta, tokens o CSS: listar los HEX y pasarlos con su área aproximada: `python3 scripts/medir_color.py --hex "#111827:55,#F9FAFB:30,#7C3AED:10,#F59E0B:5"`. Sin áreas, el orden manda: primero el dominante.
   - Un diseño en código: abrirlo en el navegador, tomar captura y medirla.
   - App, tablero o formulario: sumar `--interfaz`. Marca o pieza para imprimir: sumar `--especificar` (HEX, RGB y CMYK de los tres roles).
2. **Elegir los tres.** El script propone 60, 30 y 10 y marca los sobrantes. Revisar su propuesta con criterio:
   - El 60 es el que más área ocupa y descansa la vista: un neutro o un tono poco saturado.
   - El 30 contrasta con el 60 (4,5 o más si lleva texto; 3 o más si son superficies o texto grande).
   - El 10 es el color más vivo que se lee sobre el 60 (3 o más) y se queda en el llamado a la acción y el dato clave, en tres elementos por pantalla como máximo. Contar esos elementos a ojo en la pieza.
   - El 10 se distingue por tono o saturación. Un acento del mismo tono que el 60 y el 30, distinto solo en luminosidad, desaparece (el botón se pierde en una paleta monocromática).
   - Texto sobre fondo: medir cada par. Con 4,5 o más sirve para cualquier texto; entre 3 y 4,5, solo títulos y texto grande. [references/pares-texto-fondo.md](references/pares-texto-fondo.md) trae 32 pares con su emoción y su contraste medido.
   - Cada sobrante se une al rol de su mismo tono, pasa a variante de un rol o sale. Si marca un estado, queda solo en ese estado.
3. **Psicología.** Revisar con [references/psicologia.md](references/psicologia.md) que el 60 cargue la emoción que la pieza busca y el 10 la acción. Preguntar primero si el color es pertinente para esta marca en este contexto. Considerar sector, público, país y, si la marca lo tiene definido, su arquetipo. Para una marca nueva o un rediseño, auditar los colores de la competencia y decidir si encajar o destacar. Si un color contradice la emoción, la pertinencia o el sector, proponer su reemplazo y decir por qué.
   - Modo oscuro: seguir [references/modo-oscuro.md](references/modo-oscuro.md) (fondo casi negro, acento 20–30 % menos saturado, capas más claras al subir).
4. **Propuesta.** Entregar siempre en este formato:

   | | Antes | Propuesta | Por qué |
   | --- | --- | --- | --- |
   | 60 | … | … | … |
   | 30 | … | … | … |
   | 10 | … | … | … |
   | Salen | … | — | … |

   Debajo: el reparto medido y el objetivo, los contrastes clave, y dos o tres paletas de [references/paletas.md](references/paletas.md) cercanas a la intención, con su nombre. Mostrarlas visualmente: abrir `galeria.html` filtrada al sector (o en «Texto y fondo» para titulares y portadas), o generar una imagen con las barras 60/30/10 de la propuesta.
5. **Aplicar.** Con la aprobación de Angel, cambiar los colores en el archivo, el código o los tokens. En código, nombrar los roles (`--color-60`, `--color-30`, `--color-10` o los tokens del proyecto). En una marca, documentar cada color en HEX, RGB, CMYK y Pantone: el CMYK del script es aproximado y cerca del 30 % de los Pantone quedan fuera del rango del CMYK, así que se confirma con la imprenta.
6. **Verificar.** Medir de nuevo el resultado y desenfocarlo: `python3 scripts/medir_color.py <imagen> --desenfoque desenfocada.png` (el mismo test del paso 2 de Revisión de `diseno-grafico`, con `gblur=sigma=12` en ffmpeg). Queda listo cuando el 60 está entre 50 y 70 %, el 30 entre 20 y 40 %, el 10 entre 5 y 15 % (en interfaces, el margen de `--interfaz`), el acento aparece en tres elementos como máximo, los contrastes pasan y la imagen desenfocada muestra tres zonas planas. Manchas de color repartidas por toda la pieza indican demasiados acentos.

## Relación con otras skills

| Skill | Cómo se combinan |
| --- | --- |
| `diseno-grafico` (skills-angel) | Decide la jerarquía y el orden función, emoción, cultura, sector y estrategia, y en el paso 2 de Revisión hace el test de desenfoque del color. Esta skill pone los tres colores y sus proporciones dentro de ese orden |
| `diseno-web` y `impeccable` (skills-angel) | Son las dueñas del estilo de una web. Cuando el encargo pide color inmersivo (un fondo de marca a toda pantalla), esta skill muestra la diferencia con la regla y Angel decide. Los grises tintados con el tono del acento los decide `impeccable` |
| `design-engineering` (skills-angel) | Trae las escalas OKLCH, los tokens y el modo oscuro. En interfaces, su «neutros 80–90 %» equivale aquí a un 60 y un 30 neutros |
| `brandkit`, `logos-angel`, `marca-seleccion` | Cuando la marca ya tiene colores, esos colores se conservan y esta skill solo los reparte en roles |
| `cerebro:ux-ui` | Accesibilidad y contraste de interfaz: sus criterios siguen aplicando |

## Mantenimiento

- Paleta nueva: sumarla a `scripts/paletas.json` y correr `python3 scripts/generar.py`; regenera `references/paletas.md` y `galeria.html` con contrastes y armonía calculados. Un par de texto y fondo va en `scripts/pares.json` y sale en `references/pares-texto-fondo.md`.
- Caso real medido: sumarlo a `references/ejemplos.md` con su enlace público.
- Cada guardado que aporte paletas o criterios de color suma su fila en `fuentes.md`.
