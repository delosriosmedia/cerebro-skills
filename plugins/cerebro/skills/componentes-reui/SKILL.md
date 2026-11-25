---
name: componentes-reui
description: Úsala cuando Angel construya en React un diagrama de Gantt, una tabla editable tipo hoja de cálculo, un calendario de eventos, un constructor de filtros o un selector anidado (cascader). Muestra la galería de los cinco componentes gratuitos de ReUI, pregunta cuál usar y lo instala con la CLI de shadcn (Gantt, data grid, event calendar, filter builder, cascader).
---

# Componentes complejos de ReUI

Cinco componentes React que cuestan miles de líneas de código ya existen gratis en ReUI (licencia MIT). Esta skill los muestra en una galería, pregunta cuál usar y lo instala en el proyecto; Claude dedica el trabajo a adaptarlo.

## Cuándo se activa

- Angel pide en un proyecto React un Gantt o cronograma de tareas, una tabla editable con selección de celdas, un calendario con vistas y arrastre, un constructor de filtros o consultas, o un selector de opciones anidadas.
- El hook `hooks/sugerir-componentes-reui.sh` del plugin detecta esos pedidos, abre la galería una vez por sesión y le recuerda a Claude seguir esta skill.

## Pasos

1. **Galería.** Abrir `galeria.html` de esta carpeta en el navegador (`open <ruta>/galeria.html` en el Mac). El hook ya la abre en el primer mensaje de la sesión; en los siguientes, abrirla si Angel la pide.
2. **Pregunta.** Con la herramienta de preguntas (AskUserQuestion), preguntar qué componente usar. Recomendar el que encaja con el pedido y ofrecer «Hacerlo con código propio».
3. **Proyecto.** Revisar que el proyecto tenga `components.json` (shadcn/ui) y React 19. Si falta, proponer `npx shadcn@latest init` y declarar el registro `@reui` según [la guía de ReUI](https://reui.io/docs/registry).
4. **Instalación.** Correr el comando con `--dry-run`, explicar a Angel qué archivos y dependencias suma y, con su aprobación, instalarlo.
5. **Adaptación.** Conectar el componente a los datos reales del proyecto y a su sistema de diseño (colores, tipografía, espaciado). Mostrar el resultado antes de seguir.
6. **Aprendizaje.** Si Angel cuenta por qué eligió o descartó un componente, ofrecer guardarlo como criterio en `ux-ui/patrones-componentes` y actualizar la «Decisión» de la ficha.

## Los cinco componentes

| Componente | Qué produce | Ideal para | Comando |
| --- | --- | --- | --- |
| Gantt | Tareas en una línea de tiempo; arrastrar mueve, tirar del borde cambia la duración | Cronogramas de proyectos, producción de contenido, lanzamientos | `npx shadcn@latest add @reui/gantt` |
| Data grid | Tabla tipo hoja de cálculo: rango de celdas, copiar, pegar y editar en la celda | Inventarios, presupuestos, listas de clientes editables | `npx shadcn@latest add @reui/data-grid` |
| Event calendar | Vistas de mes, semana, día y agenda, con arrastrar y soltar y zonas horarias | Reservas, agendas de equipo, calendarios editoriales | `npx shadcn@latest add @reui/event-calendar` |
| Filter builder | Condiciones paso a paso con su editor de valor; devuelve un árbol de reglas en JSON | Búsquedas avanzadas en paneles y tablas con muchos campos | `npx shadcn@latest add @reui/filters` |
| Cascader | Lista anidada en un solo campo, con niveles, migas de pan y búsqueda | Categorías, ubicaciones (país › ciudad), carpetas | `npx shadcn@latest add @reui/cascader` |

Ficha con riesgos e instalación: `repos/keenthemes-reui.md` del repositorio cerebro-skills.

## Fuente

[Reel de Instagram de reui_io](https://www.instagram.com/reel/Dfq2lKoRIEq/) guardado el 2026-11-25.
