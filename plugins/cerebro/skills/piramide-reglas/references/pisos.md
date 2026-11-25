# Ejemplos de cada piso

Ejemplos para ubicar reglas reales. Primero los de la charla de Lauren Tan y los del reel; después, mecanismos por stack.

## Ejemplos de la charla

Lauren Tan (Grok Bot y el framework Electron Dune) presentó estos casos en «All Code Is Slop (Except Mine)», AI Engineer CODE Summit 2026. Los datos vienen de resúmenes publicados de la charla.

| Problema del agente | Piso donde quedó resuelto | Mecanismo |
| --- | --- | --- |
| Importaba código del proceso principal dentro de la interfaz (renderer) de una app Electron, y la interfaz se trababa | 1 y 2 | Carpetas separadas para proceso principal e interfaz, tipos compartidos en una carpeta común, y un chequeo de dependencias que rechaza el import cruzado |
| Usaba mal una API llena de matices (`useEffect` en React) | 1 y 2 | La API queda prohibida por lint; el equipo usa alternativas con menos formas de fallar |
| Justificaba arreglos rápidos con comentarios | 2 | Casi todos los comentarios quedan prohibidos; reglas de lint con mensajes que piden arreglar la causa |
| Cada corrección terminaba como otra línea en AGENTS.md | 2 | La pregunta ante cada error: ¿puede ser una regla de lint, una restricción de tipo o un refactor que borre el patrón? |
| Revisar miles de pull requests a mano | 5 | La revisión humana mira evidencia: videos, capturas, diagramas y pruebas |

Ideas de la charla que guían la skill:
- El trabajo del ingeniero con agentes es mantener o subir la calidad mientras sube el volumen, y el camino es confiar en el entorno del agente: el código, los chequeos y las pruebas.
- El mensaje de un lint es el mejor lugar para una instrucción: el agente la lee justo cuando rompe la regla.
- Automatizar un ciclo que produce código malo produce más código malo: primero se arregla el ciclo.
- Lo que pide demasiados matices para usarse bien termina mal usado: mejor una API más simple.

## Ejemplos del reel

La tienda del reel reparte cuatro reglas en cuatro pisos:

| Regla | Piso | Mecanismo concreto |
| --- | --- | --- |
| `precio ≥ 0` | 1 y 3 | Tipo `Precio` que se crea solo con valores válidos, y `CHECK (precio >= 0)` en la tabla |
| `cantidad ≥ 1` | 1 y 3 | Tipo o esquema de validación con mínimo 1, y `CHECK (cantidad >= 1)` |
| `stock ≥ 0` | 2 y 3 | Prueba que descuenta más unidades de las que hay y espera un error, y `CHECK (stock >= 0)` |
| `cupones ≤ 1` por compra | 3 | Restricción única en la tabla de cupones aplicados, o validación en la función que aplica el cupón |

Caso del reel: con la regla «precio ≥ 0» escrita solo en `instrucciones.md`, aplicar cupones bajó el total a −$5. Al bajar la regla a pruebas y a código, el error quedó sin forma de repetirse.

## Mecanismos por stack

### TypeScript, React y Next.js

| Piso | Mecanismo |
| --- | --- |
| 1 | `tsconfig` con `strict: true`; tipos de dominio con marca (`type Precio = number & { __marca: 'Precio' }`) y una sola función que los crea; carpetas `server/` y `client/` |
| 2 | ESLint con `no-restricted-imports` o `eslint-plugin-boundaries` para separar capas; `dependency-cruiser` para el grafo de imports; reglas propias con `message` que dice el arreglo; Vitest o Playwright para las reglas de negocio |
| 3 | Zod en cada borde (formularios, API, webhooks); `server-only` para módulos que nunca llegan al cliente |

Mensaje de lint que guía al agente:

```js
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['@/server/*'],
    message: 'El cliente nunca importa del servidor. Mueve el tipo compartido a @/shared o llama a la acción del servidor.'
  }]
}]
```

### Python

| Piso | Mecanismo |
| --- | --- |
| 1 | Tipos de dominio con `dataclass(frozen=True)` o Pydantic que validan al crearse |
| 2 | `pyright` o `mypy` en modo estricto; `ruff` con reglas activadas a propósito; `import-linter` para capas; `pytest` con pruebas de las reglas de negocio |
| 3 | Pydantic en cada entrada externa; aserciones en invariantes críticas |

### Supabase y Postgres

| Piso | Mecanismo |
| --- | --- |
| 1 | Funciones SQL o RPC como única puerta para operaciones delicadas (cobrar, descontar stock) |
| 2 | Pruebas de las funciones SQL y los asesores de seguridad de Supabase en CI |
| 3 | `CHECK`, `NOT NULL`, `UNIQUE`, llaves foráneas; políticas RLS para permisos; triggers para invariantes entre tablas |

### Claude Code

| Piso | Mecanismo |
| --- | --- |
| 2 | Hook `PostToolUse` sobre `Edit` y `Write` que corre lint y tipos del archivo editado y devuelve los errores al agente |
| 2 | Hook `PreToolUse` que bloquea comandos peligrosos (borrar tablas, `git push --force`) |
| 4 | CLAUDE.md corto: lo que pide juicio y el mapa de dónde vive cada regla |
| 5 | Permisos que piden aprobación en acciones destructivas; pull requests con capturas o video de lo que cambió |

## Cómo bajar una regla un piso

| Desde | Hacia | Pregunta guía |
| --- | --- | --- |
| 5 revisión humana | 4 texto | ¿Lo corrijo siempre igual? Escríbelo |
| 4 texto | 3 ejecución | ¿Se puede comprobar con datos reales al correr? |
| 4 texto | 2 estático | ¿Se ve en el código sin ejecutarlo? |
| 3 ejecución | 2 estático | ¿Una prueba o un tipo lo detecta antes de correr? |
| 2 estático | 1 diseño | ¿Un refactor hace que el patrón malo deje de existir? |
