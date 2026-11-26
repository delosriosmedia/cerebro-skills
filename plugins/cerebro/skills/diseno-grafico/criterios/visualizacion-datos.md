# Visualización de datos

**Alcance:** Aquí viven los criterios sobre gráficas de datos: elegir qué mostrar, resaltar el mensaje dentro de la gráfica, anotaciones y lectura de cifras.

## Criterios

### C-002 · Enfocar la gráfica en el mensaje
- **Regla:** cuando la gráfica tiene un mensaje concreto, dibuja los datos base en gris y marca el foco con un solo color de acento más una anotación corta con la cifra. Elige la técnica según el mensaje:

  | Mensaje | Técnica | Anotación |
  | --- | --- | --- |
  | Déficit frente a una meta | Línea punteada del plan y área sombreada entre el plan y el dato real | La brecha al final, con flecha («−37 %») |
  | Recuperación tras una caída | Línea punteada desde cada pico y área sombreada hasta que el dato vuelve a ese nivel | El tiempo de cada recuperación («20 días») |
  | Concentración | Las barras del grupo en el color de acento y una llave que las agrupa | Su parte del total («28 % del total») |
  | Umbral | Línea punteada de la meta y los puntos bajo ella en el color de acento | El porcentaje bajo la meta en cada grupo («48 % debajo») |

- **Cuándo aplica:** gráficas para presentaciones, informes, paneles y piezas de redes que deben llevar la atención a un dato puntual. Para explorar datos sin un mensaje definido, basta la gráfica base.
- **Fuente:** https://www.instagram.com/p/Df2QtFYIHCr/ · 2026-11-25

### C-003 · Series legibles con daltonismo: un color frío y uno cálido
- **Regla:** cuando dos series de igual peso se distinguen solo por color, usa un color frío y uno cálido, a lados opuestos del eje azul-amarillo. Rojo y verde juntos se funden en un oliva para quien tiene daltonismo rojo-verde (cerca de 1 de cada 12 hombres), y la leyenda deja de servir. Parejas probadas sobre fondo claro:

  | Pareja | Frío | Cálido | Fondo | Lectura con daltonismo (medida) |
  | --- | --- | --- | --- | --- |
  | Azul y naranja | `#2F6FDE` | `#F08A24` | `#FBF9F5` | La más firme en los tres tipos; el naranja se ve mostaza |
  | Púrpura y dorado | `#6B3FA0` | `#E0B02A` | `#FAF8FC` | Firme en rojo-verde; más justa en tritanopia (azul-amarillo) |
  | Verde azulado y coral | `#138A8A` | `#F26B5B` | `#F7FAFA` | Se distingue en deuteranopia; en protanopia queda cerca del rojo y verde: sumar etiqueta directa |

  Dos ajustes al usarlas:
  - El color cálido queda por debajo de 3:1 sobre el fondo claro (naranja 2,4; dorado 1,9; coral 2,8). Para líneas finas y puntos, usa una variante más oscura del cálido o un borde; las barras y áreas grandes se leen bien.
  - Acompaña el color con una segunda señal: etiqueta directa al final de la serie, trazo punteado o forma del marcador.
- **Cuándo aplica:** gráficas con dos series que se comparan de igual a igual (este año y el anterior, web y app, hecho y pendiente). Cuando la gráfica destaca un solo dato, manda C-002 (gris más un acento).
- **Fuente:** https://www.instagram.com/p/DgHJ-TqFpvS/ (@uxbrainy, «color palettes vol 18») · 2026-11-26. Lectura con daltonismo medida con la simulación de Machado (2009).

## Formato de cada criterio

```markdown
### C-000 · <título corto>
- **Regla:** <la indicación en una o dos frases>
- **Cuándo aplica:** <situación>
- **Fuente:** <enlace> · <fecha>
```
