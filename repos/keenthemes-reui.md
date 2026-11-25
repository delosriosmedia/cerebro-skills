# ReUI (keenthemes/reui)

**Qué hace:** Registro de componentes para shadcn/ui con cinco componentes React complejos y gratuitos: diagrama de Gantt, tabla tipo hoja de cálculo (data grid), calendario de eventos, constructor de filtros y cascader. Cada uno entra al proyecto con un comando de la CLI de shadcn y su código queda en el proyecto, listo para cambiarlo.

**Enlace y estado:** [github.com/keenthemes/reui](https://github.com/keenthemes/reui) · 4.305 estrellas · último push 2026-10-16 · MIT · catálogo en [reui.io/components](https://reui.io/components). Viene en dos versiones: Base UI y Radix UI. Pide React 19 o superior.

**Para qué le sirve a Angel:** skill madre `ux-ui` (subtema `patrones-componentes`). Uso: cuando un proyecto React necesita uno de estos cinco componentes, Claude Code lo instala en segundos y dedica el trabajo a adaptarlo, en lugar de escribir miles de líneas desde cero.

| Componente | Qué hace | Comando |
| --- | --- | --- |
| Gantt | Tareas en una línea de tiempo; arrastrar una barra la mueve y tirar del borde cambia su duración | `npx shadcn@latest add @reui/gantt` |
| Data grid | Tabla que funciona como hoja de cálculo: seleccionar un rango, copiar, pegar y escribir en la celda (TanStack Table y TanStack Virtual) | `npx shadcn@latest add @reui/data-grid` |
| Event calendar | Vistas de mes, semana, día y agenda, con arrastrar y soltar y zonas horarias | `npx shadcn@latest add @reui/event-calendar` |
| Filter builder | Condiciones paso a paso, cada una con su editor de valor; devuelve el árbol de reglas en JSON | `npx shadcn@latest add @reui/filters` |
| Cascader | Lista anidada dentro de un solo campo, con navegación por niveles, migas de pan y búsqueda | `npx shadcn@latest add @reui/cascader` |

**Riesgos:**

- Necesita un proyecto con shadcn/ui configurado (`components.json`). El registro `@reui` se declara en ese archivo según [la guía de ReUI](https://reui.io/docs/registry).
- ReUI también vende bloques Pro con licencia; los cinco componentes de esta ficha son gratuitos. Una clave de licencia Pro va en `.env.local`, fuera del repositorio.
- Antes de instalar, revisar con `npx shadcn@latest add @reui/<nombre> --dry-run` qué archivos y dependencias suma.

**Instalación propuesta** (dentro del proyecto React donde se use, con Claude Code, tras la aprobación de Angel):

```bash
# 1. Proyecto con shadcn/ui (si aún no lo tiene)
npx shadcn@latest init
# 2. Ver qué suma el componente elegido
npx shadcn@latest add @reui/data-grid --dry-run
# 3. Instalarlo
npx shadcn@latest add @reui/data-grid
```

**Decisión:** pendiente · 2026-11-25. La sugiere el hook `plugins/cerebro/hooks/sugerir-componentes-reui.sh` y la muestra la galería de la skill `componentes-reui`.

**Fuente:** [reel «5 React components Claude Code doesn't build from scratch»](https://www.instagram.com/reel/Dfq2lKoRIEq/), Instagram, reui_io · guardado el 2026-11-25.
