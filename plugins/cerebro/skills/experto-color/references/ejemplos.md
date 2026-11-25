# Ejemplos de la regla aplicada

Casos reales medidos con `scripts/medir_color.py`. Sirven para mostrarle a Angel cómo se ve la regla en una pieza terminada y cómo leer la medición.

## Finance App · 60/30/10 Color Rule

[Shot en Dribbble](https://dribbble.com/shots/26654173-Finance-AppDesign-60-30-10-Color-Rule), de Pradeep Maurya. Tres pantallas de una app de finanzas.

| Rol | Color | Dónde está |
| --- | --- | --- |
| 60 | Gris muy claro `#F4F4F6` (con blanco de tarjetas) | Fondo de pantallas y tarjetas de saldo |
| 30 | Casi negro `#050505` / `#262626` | Texto, cifras y la barra deslizable «Get Started» / «Send Now» |
| 10 | Violeta `#5C55B3` a `#7859E6` | Botones de acción, ícono activo del menú, «See All», tecla de enviar |

Medición (`--interfaz`): 60 ≈ 86 %, 30 ≈ 11 %, 10 ≈ 3 %. Así se ve casi siempre una interfaz clara: el reparto por área da más neutro que el 60 % teórico, y la regla se cumple por roles. El 10 está en un grupo de cuatro botones de acción iguales más dos detalles: un grupo repetido de acciones del mismo tipo se lee como un solo foco.

Lecciones:
- El 30 oscuro en texto y en una sola barra de acción principal da jerarquía fuerte con muy poca área.
- El violeta pasa 4,4 sobre el fondo: sirve para íconos y botones; para texto violeta pequeño hace falta un tono más oscuro.

## messenger. · UI Design

[Shot en Dribbble](https://dribbble.com/shots/10804470-messenger-UI-Design), de Nguyen Minh Tien. Interfaz editorial en blanco y negro con retícula de 24 px.

| Rol | Color | Dónde está |
| --- | --- | --- |
| 60 | Blanco `#FDFDFD` (o negro en el menú) | Fondo de cada pantalla |
| 30 | Negro `#020202` | Tipografía grande, bloques y fotos en blanco y negro |
| 10 | Rojo `#E61D1C` | Una o dos palabras por pantalla: la sección activa del menú, un subtítulo |

Lecciones:
- Base neutra más un acento: la armonía más legible y la más fácil de aplicar.
- El acento aparece en uno o dos elementos por pantalla; con tan poca área, el rojo manda sobre toda la composición.
- En el menú oscuro los roles se invierten (negro de 60, blanco de 30) y el rojo sigue siendo el 10.

## Lumina M1 · hero de landing

Del [reel de @go.expoose](https://www.instagram.com/reel/Df2T5GEs386/). Medición del hero: 60 azul Klein ≈ 72 % (con sus variantes oscuras), 30 blanco ≈ 4 % fuera de la cámara 3D, 10 naranja ≈ 9 %. El render del producto domina el área; en piezas con foto o 3D se mide el diseño alrededor con `--recorte` y el objeto se evalúa aparte.
