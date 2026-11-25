# Montar un proyecto de producción con Claude Code

Lista de verificación de ocho pasos para construir con Claude Code una app que va a producción. El ingeniero define la arquitectura, da contexto y toma las decisiones; el agente escribe, propone y arregla dentro de esos límites. Cada paso nombra dónde vive su tema dentro del cerebro.

## Cuándo usar

- Al arrancar una app, un SaaS o un servicio nuevo con Claude Code.
- Al revisar un proyecto en marcha que va a recibir usuarios reales.
- Cuando Angel pide «constrúyeme una app» sin arquitectura definida.
- Cuando el hook `hooks/sugerir-proyecto-produccion.sh` del plugin detecta el inicio de un proyecto y Claude ve que el momento lo amerita.

## Pasos

Claude recorre los ocho pasos en orden. En un proyecto en marcha, marca cada paso como cumplido, pendiente o fuera de alcance, y propone primero los pendientes de los pasos 6, 7 y 8, porque protegen producción.

| # | Paso | Qué se hace | Dónde ampliar |
| --- | --- | --- | --- |
| 1 | Arquitectura antes del código | Escribir un documento de arquitectura con framework, base de datos, autenticación e integraciones. El código empieza cuando el documento está aprobado. | `desarrollo-backend` |
| 2 | Skill de diseño propia | Darle al agente una skill de diseño con tokens, reglas de espaciado, convenciones de componentes y guía de marca. Así la interfaz sale con identidad propia, lejos del degradado morado y las tarjetas redondeadas de serie. | `ux-ui`, `diseno-grafico` |
| 3 | Documentación actual por MCP | Conectar por MCP la documentación vigente de cada librería y API del stack, para que el agente use los métodos actuales y deje atrás los que aprendió en su entrenamiento. | `claude-mods/criterios/servidores-mcp.md` |
| 4 | Prompt estructurado | Cada encargo al agente lleva cuatro partes: contexto (proyecto, archivos y decisiones previas), tarea (qué construir o cambiar), restricciones (stack, límites, lo que queda intacto) y salida esperada (archivos, formato, pruebas que deben pasar). | esta sub-skill |
| 5 | El ingeniero decide | En cada decisión de fondo (colas, estrategia de autenticación, base de datos), el agente pregunta, presenta las opciones con su contexto y el ingeniero elige. | `claude-mods/criterios/flujos-claude.md` |
| 6 | Aprobación humana en acciones destructivas | Aplicar la protección del riesgo LLM03 (agencia excesiva) de la sub-skill de seguridad: aprobación humana en cada acción sin vuelta atrás en producción. | `automatizacion-ia/sub-skills/auditar-seguridad-ia.md`, LLM03 |
| 7 | Pruebas y revisión en cada pull request | El pipeline de CI corre pruebas automáticas y una revisión con agente en cada pull request, antes de fusionar. | `claude-mods/criterios/flujos-claude.md` |
| 8 | Monitor de errores con triaje | Un monitor captura los fallos de producción; un agente de triaje los analiza y abre un pull request de arreglo que el ingeniero revisa antes de fusionar. | `automatizacion-ia/criterios/flujos-agentes.md` |

## Verificación

- Existe un documento de arquitectura aprobado antes del primer commit de código.
- El proyecto tiene una skill o guía de diseño propia cargada para el agente.
- Cada librería principal del stack tiene su documentación disponible por MCP.
- Las decisiones de arquitectura quedan anotadas con la opción elegida y quién la eligió.
- Ninguna herramienta del agente puede borrar, migrar, pagar o enviar en producción sin aprobación humana.
- Cada pull request corre pruebas y revisión antes de fusionarse.
- Los errores de producción llegan a un monitor y terminan en un pull request revisado por una persona.

## Fuente

- [Video de @corespear en Instagram](https://www.instagram.com/p/DfhpCg0Jdba/), «From Vibe Coder to AI Engineer» · guardado el 2026-11-25.
