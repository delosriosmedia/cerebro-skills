# Auditar la seguridad de una app con IA

Revisión en 10 puntos para cualquier app, agente o automatización que use un modelo de lenguaje. Sigue el OWASP Top 10 para aplicaciones con LLMs, edición 2026.

## Cuándo usar

- Antes de publicar una app, un agente o un flujo que llama a un modelo de lenguaje.
- Al darle a un agente herramientas nuevas, acceso a datos o permisos de escritura.
- Al conectar un RAG, un servidor MCP o una fuente externa (webs, correos, documentos).
- Cuando Angel pide revisar la seguridad de un proyecto con IA.

## Pasos

Recorre los 10 riesgos en orden. En cada uno, mira la app real (código, prompts, herramientas, permisos) y anota: cumple, falla o no aplica.

| # | Riesgo | Qué pasa | Cómo protegerte |
| --- | --- | --- | --- |
| LLM01 | Prompt injection | El modelo obedece órdenes escondidas en lo que lee (una web, un correo, un archivo). | Trata todo contenido externo como datos para leer y limita lo que el modelo puede hacer con él. |
| LLM02 | Revelación de datos sensibles | El modelo entrega datos de otro usuario o datos personales. | Aplica permisos por usuario a lo que el modelo consulta y filtra los datos personales antes de responder. |
| LLM03 | Agencia excesiva | El agente puede hacer más de lo que pide la tarea (borrar, pagar, administrar). Subió del 6.º al 3.º puesto en 2026. | Dale solo las herramientas de la tarea y pide confirmación humana en toda acción sin vuelta atrás. |
| LLM04 | Cadena de suministro | Entran piezas comprometidas: modelos, datasets, plugins o dependencias. | Usa fuentes verificadas, fija versiones, comprueba firmas y lleva un inventario de modelos y dependencias. |
| LLM05 | Envenenamiento de datos y del modelo | Datos manipulados cambian las respuestas del modelo. | Controla el origen de los datos de entrenamiento y evalúa el modelo buscando respuestas raras. |
| LLM06 | Consumo sin límites | Un atacante dispara peticiones, la factura de la API crece y el servicio cae. | Pon límites de tokens, de peticiones y de gasto por usuario, con alertas al acercarse al tope. |
| LLM07 | Desinformación y alucinaciones | El modelo responde algo falso con total seguridad, incluso paquetes inventados para instalar. | Pide respuestas con fuentes verificables, revisión humana en decisiones importantes y comprueba cada paquete antes de instalarlo. |
| LLM08 | Exposición de contexto oculto | Alguien logra leer el prompt del sistema, reglas internas o claves. Antes se llamaba System Prompt Leakage. | Deja los secretos fuera del prompt y asume que todo el contexto oculto puede acabar a la vista. |
| LLM09 | Debilidades en vectores y embeddings | El RAG mezcla datos de usuarios o usa documentos falsos. | Separa los datos por usuario o cliente, aplica permisos en la búsqueda y valida lo que entra a la base vectorial. |
| LLM10 | Manejo inadecuado de la salida | La app usa lo que genera el modelo sin revisarlo y termina ejecutando código o scripts. | Trata la salida del modelo igual que la entrada de un usuario: valídala, escápala y evita ejecutarla directamente. |

## Verificación

- Los 10 puntos tienen estado (cumple, falla o no aplica) con la evidencia: archivo, prompt o configuración revisada.
- Cada punto que falla tiene una corrección propuesta y su prioridad. Primero LLM01, LLM02, LLM03 y LLM08, porque exponen datos o permiten acciones.
- Las claves y credenciales viven en secretos del servidor y quedan fuera de prompts, código del cliente y repositorios.
- Toda herramienta que borra, paga, publica o envía pide confirmación humana.
- Hay topes de gasto y alertas configurados en cada API de modelos que usa la app.

## Fuente

- [Carrusel de @chanti.dev en Instagram](https://www.instagram.com/p/DgDpP79kUQo/) · 2026-11-22, basado en el OWASP Top 10 para aplicaciones con LLMs, edición 2026.
