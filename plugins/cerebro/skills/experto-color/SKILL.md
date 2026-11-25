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
| 10 · acento | 5 a 15 % | Dirige la mirada a lo importante | Llamado a la acción, dato clave, enlace, precio |

Cuenta el acento: aparece en tres elementos por pantalla como máximo; con más, deja de destacar. Un tercer color con el mismo peso que los otros dos abarata la pieza: redúcelo al 10 % o quítalo.

Cómo se cuentan los colores:
- Variantes claras u oscuras del mismo tono cuentan como el mismo color (un azul y su versión al 20 % son un solo rol).
- Los colores de estado (error, éxito, alerta) quedan fuera del conteo y siempre van con icono o texto.
- Las fotos y las ilustraciones quedan fuera de la medición; se mide el diseño que las rodea.
- En apps, tableros y formularios el 60 y el 30 suelen ser neutros (fondo y superficies o texto), y el 10 es el color de marca en acciones y estados seleccionados.

Esta regla es la C-001 de `diseno-grafico/criterios/color.md`; esta skill es su procedimiento completo.

## Pasos

1. **Inventario.** Reunir los colores en uso:
   - Imagen, captura o render: `python3 scripts/medir_color.py <imagen>` (con `--recorte x,y,ancho,alto` para dejar fuera fotos o bordes).
   - Paleta, tokens o CSS: listar los HEX y pasarlos con su área aproximada: `python3 scripts/medir_color.py --hex "#111827:55,#F9FAFB:30,#7C3AED:10,#F59E0B:5"`. Sin áreas, el orden manda: primero el dominante.
   - Un diseño en código: abrirlo en el navegador, tomar captura y medirla.
2. **Elegir los tres.** El script propone 60, 30 y 10 y marca los sobrantes. Revisar su propuesta con criterio:
   - El 60 es el que más área ocupa y descansa la vista: un neutro o un tono poco saturado.
   - El 30 contrasta con el 60 (4,5 o más si lleva texto; 3 o más si son superficies o texto grande).
   - El 10 es el color más vivo que se lee sobre el 60 (3 o más) y se queda en el llamado a la acción y el dato clave, en tres elementos por pantalla como máximo. Contar esos elementos a ojo en la pieza.
   - Cada sobrante se une al rol de su mismo tono, pasa a variante de un rol o sale. Si marca un estado, queda solo en ese estado.
3. **Psicología.** Revisar con [references/psicologia.md](references/psicologia.md) que el 60 cargue la emoción que la pieza busca y el 10 la acción. Considerar sector, público y país. Si un color contradice la emoción o el sector, proponer su reemplazo y decir por qué.
4. **Propuesta.** Entregar siempre en este formato:

   | | Antes | Propuesta | Por qué |
   | --- | --- | --- | --- |
   | 60 | … | … | … |
   | 30 | … | … | … |
   | 10 | … | … | … |
   | Salen | … | — | … |

   Debajo: el reparto medido y el objetivo, los contrastes clave, y dos o tres paletas de [references/paletas.md](references/paletas.md) cercanas a la intención, con su nombre. Mostrarlas visualmente: abrir `galeria.html` filtrada al sector, o generar una imagen con las barras 60/30/10 de la propuesta.
5. **Aplicar.** Con la aprobación de Angel, cambiar los colores en el archivo, el código o los tokens. En código, nombrar los roles (`--color-60`, `--color-30`, `--color-10` o los tokens del proyecto).
6. **Verificar.** Medir de nuevo el resultado y desenfocarlo: `python3 scripts/medir_color.py <imagen> --desenfoque desenfocada.png` (el mismo test del paso 2 de Revisión de `diseno-grafico`, con `gblur=sigma=12` en ffmpeg). Queda listo cuando el 60 está entre 50 y 70 %, el 30 entre 20 y 40 %, el 10 entre 5 y 15 %, el acento aparece en tres elementos como máximo, los contrastes pasan y la imagen desenfocada muestra tres zonas planas. Manchas de color repartidas por toda la pieza indican demasiados acentos.

## Relación con otras skills

| Skill | Cómo se combinan |
| --- | --- |
| `diseno-grafico` (skills-angel) | Decide la jerarquía y el orden función, emoción, cultura, sector y estrategia, y en el paso 2 de Revisión hace el test de desenfoque del color. Esta skill pone los tres colores y sus proporciones dentro de ese orden |
| `diseno-web` y `impeccable` (skills-angel) | Son las dueñas del estilo de una web. Cuando el encargo pide color inmersivo (un fondo de marca a toda pantalla), esta skill muestra la diferencia con la regla y Angel decide. Los grises tintados con el tono del acento los decide `impeccable` |
| `design-engineering` (skills-angel) | Trae las escalas OKLCH, los tokens y el modo oscuro. En interfaces, su «neutros 80–90 %» equivale aquí a un 60 y un 30 neutros |
| `brandkit`, `logos-angel`, `marca-seleccion` | Cuando la marca ya tiene colores, esos colores se conservan y esta skill solo los reparte en roles |
| `cerebro:ux-ui` | Accesibilidad y contraste de interfaz: sus criterios siguen aplicando |

## Mantenimiento

- Paleta nueva: sumarla a `scripts/paletas.json` y correr `python3 scripts/generar.py`; regenera `references/paletas.md` y `galeria.html` con contrastes y armonía calculados.
- Cada guardado que aporte paletas o criterios de color suma su fila en `fuentes.md`.
