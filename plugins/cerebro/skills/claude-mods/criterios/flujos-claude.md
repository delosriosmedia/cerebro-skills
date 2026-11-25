# Flujos en Claude

**Alcance:** Aquí viven los criterios sobre modos de trabajo, uso de subagentes, gestión de contexto y rutinas productivas en Claude.

## Criterios

### C-001 · Cada error repetido del agente se vuelve una regla automática
- **Regla:** cuando el agente de código repite un error, convierte la corrección en algo que se verifica solo: una regla de lint, una prueba, un tipo o un hook que salta si el error vuelve. Corregir por chat o escribir «IMPORTANTE» en mayúsculas en CLAUDE.md deja la corrección a merced del contexto; la regla automática corre en cada cambio.
- **Cuándo aplica:** al corregir dos veces lo mismo a Claude Code o a otro agente de código, y al revisar un proyecto donde un mismo parche aparece en varios archivos. Para correcciones de diseño, la skill `learn-taste` aplica esta misma idea con tokens y reglas de lint de estilo.
- **Fuente:** [Video de @alexaguirre.ai en YouTube](https://www.youtube.com/watch?v=yvhC3ZiaWsI), sobre la charla de Lauren Tan en AI Engineer Code Summit · 2026-11-25

### C-002 · Borrar del código los parches y comentarios-excusa
- **Regla:** el agente copia lo que ve en el repositorio, incluidos los parches y los comentarios que los justifican («lo libero luego, por si vuelve»). Arregla la causa, borra el parche y su comentario-excusa, y deja comentarios solo para el porqué que el código no muestra.
- **Cuándo aplica:** al limpiar un proyecto trabajado con agentes y al revisar sus pull requests. Un atajo deliberado marcado con `shortcut:` que nombra su límite y su ruta de mejora (convención de la skill `ponytail`) es deuda registrada y se conserva; el comentario-excusa suelto, sin límite ni ruta, se borra.
- **Fuente:** [Video de @alexaguirre.ai en YouTube](https://www.youtube.com/watch?v=yvhC3ZiaWsI), sobre la charla de Lauren Tan en AI Engineer Code Summit · 2026-11-25

## Formato de cada criterio

```markdown
### C-000 · <título corto>
- **Regla:** <la indicación en una o dos frases>
- **Cuándo aplica:** <situación>
- **Fuente:** <enlace> · <fecha>
```
