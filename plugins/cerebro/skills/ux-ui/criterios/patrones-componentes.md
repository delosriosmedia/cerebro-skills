# Patrones y componentes

**Alcance:** Aquí viven los criterios sobre selección y comportamiento de botones, formularios, tablas, modales, navegación y estados vacíos.

## Criterios

### C-002 · Interruptor tabla / tarjetas para listas de registros
- **Regla:** en listas de personas, clientes o proyectos, ofrece un interruptor de dos botones junto al título de la lista para cambiar entre vista de tabla (comparar muchos registros por columna) y vista de tarjetas (leer cada registro con su foto, estado y uso). Ambas vistas muestran los mismos datos y conservan filtros y orden. Al cambiar, la vista actual sale con un desenfoque rápido y la nueva entra escalonada, elemento por elemento de izquierda a derecha y de arriba abajo, pasando de borrosa a nítida, en unos 0,6 s en total.
- **Cuándo aplica:** paneles de administración y listados con más de diez registros y varios atributos por registro.
- **Fuente:** https://www.instagram.com/reel/DgAT3fVBJ8B/ · 2026-11-25

## Formato de cada criterio

```markdown
### C-000 · <título corto>
- **Regla:** <la indicación en una o dos frases>
- **Cuándo aplica:** <situación>
- **Fuente:** <enlace> · <fecha>
```
