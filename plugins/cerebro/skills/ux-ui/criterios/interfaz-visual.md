# Interfaz visual

**Alcance:** Aquí viven los criterios sobre jerarquía visual, espaciado, estados interactivos, consistencia estética y densidad en pantallas.

## Criterios

### C-001 · Tablero para decidir: qué cambió y qué hago
- **Regla:** la primera vista de un tablero responde dos preguntas: qué cambió y qué hago ahora. Se arma en tres capas:
  1. **Métricas con comparación y contexto.** Cada tarjeta muestra el número grande como protagonista, una línea de comparación con el periodo anterior («+8,2 % vs octubre») y una línea de contexto que da escala («77 % de 2.847 cupos»). La métrica principal ocupa la tarjeta más grande y lleva el color de acento.
  2. **Alerta con causa y acción.** Cuando algo se sale de lo normal, una línea explica qué pasó y por qué («La conciliación va 3,1 veces más lenta desde las 09:40; 41 ejecuciones esperan detrás de los reintentos del webhook»), con un botón para actuar ahí mismo («Pausar reintentos · 15 min») y otro para ver el detalle.
  3. **Cola «Te necesita».** Lo que espera una decisión de la persona va en una tarjeta propia con contador. Cada fila trae qué es, quién lo pidió, cuánto lleva esperando y los botones Aprobar y Rechazar en la misma fila, con atajos de teclado (↵ aprueba, Esc rechaza). Al pie, el tiempo de espera promedio. En la tabla de procesos, el estado «Esperando por ti» lleva el color de acento.
- **Animación de la cola:** al aprobar, la fila se marca con el borde de acento, el contador baja en ese instante, la fila sale y las de abajo suben a cerrar el hueco. La confirmación ocurre en la misma tarjeta, sin abrir otra pantalla.
- **Por qué:** cada minuto que alguien pasa buscando qué hacer se multiplica por el equipo. El autor estima unos 190.000 dólares al año para 40 personas que pierden una hora diaria en eso.
- **Cuándo aplica:** paneles de administración, tableros de operación y analítica y resúmenes de cuenta.
- **Fuente:** https://www.instagram.com/reel/DgAT3fVBJ8B/ · 2026-11-25 (métricas) · https://www.instagram.com/reel/Df6pH6MsJ13/ · 2026-11-25 (alerta, cola y animación)

### C-003 · Lupa de vidrio sobre grupos de avatares
- **Regla:** en un grupo de avatares o burbujas, al pasar el cursor aparece un círculo de vidrio esmerilado que sigue al puntero, agranda el elemento que toca y desenfoca su entorno. Convierte una tarjeta de resumen en algo que invita a explorar.
- **Cuándo aplica:** tarjetas de resumen con personas o elementos agrupados en paneles y tableros.
- **Fuente:** https://www.instagram.com/reel/DgAT3fVBJ8B/ · 2026-11-25

## Formato de cada criterio

```markdown
### C-000 · <título corto>
- **Regla:** <la indicación en una o dos frases>
- **Cuándo aplica:** <situación>
- **Fuente:** <enlace> · <fecha>
```
