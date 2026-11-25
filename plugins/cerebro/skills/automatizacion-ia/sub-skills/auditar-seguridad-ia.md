# Auditar la seguridad de una app con IA

Revisión de seguridad a la medida de cada app, agente o automatización que use un modelo de lenguaje. Parte del OWASP Top 10 para aplicaciones con LLMs, edición 2026, y elige según el contexto del proyecto qué riesgos revisar y con cuánta profundidad.

## Cuándo usar

- Al planear o construir una app, un agente o un flujo que llama a un modelo de lenguaje.
- Antes de publicar ese proyecto o abrirlo a otros usuarios.
- Al darle a un agente herramientas nuevas, acceso a datos o permisos de escritura.
- Al conectar un RAG, un servidor MCP o una fuente externa (webs, correos, documentos).
- Cuando Angel pide revisar la seguridad de un proyecto con IA.
- Cuando el hook `hooks/sugerir-seguridad-ia.sh` del plugin detecta un proyecto con IA y Claude ve que el momento lo amerita.

## Pasos

### 1 · Leer el contexto del proyecto

Antes de revisar, Claude arma un perfil corto del proyecto con lo que ve en el código, el plan o la conversación. Pregunta a Angel solo lo que falte.

| Rasgo | Qué mirar |
| --- | --- |
| Usuarios | Solo Angel, un equipo cerrado o público abierto |
| Entradas externas | El modelo lee webs, correos, archivos subidos o mensajes de terceros |
| Datos | Maneja datos personales, de clientes o de varios usuarios |
| Herramientas | El modelo ejecuta acciones: escribir, borrar, pagar, enviar, publicar |
| Costo | Paga por uso una API de modelos |
| RAG | Busca en una base vectorial o en documentos |
| Salida | Lo que genera el modelo se muestra en una web, se ejecuta o alimenta otro sistema |
| Piezas de terceros | Usa modelos, plugins, MCP o paquetes externos |
| Decisiones | Las respuestas del modelo guían decisiones importantes o instalaciones |
| Entrenamiento | Entrena o ajusta un modelo propio |

### 2 · Elegir los riesgos que aplican

Cada riesgo se activa con rasgos concretos del perfil. Claude revisa solo los activos y deja los demás como «no aplica», con el motivo en una línea.

| Riesgo | Se revisa cuando el proyecto… |
| --- | --- |
| LLM01 Prompt injection | Recibe entradas externas o de usuarios que el modelo lee |
| LLM02 Revelación de datos sensibles | Maneja datos personales o datos de varios usuarios |
| LLM03 Agencia excesiva | Da herramientas que actúan (escribir, borrar, pagar, enviar) |
| LLM04 Cadena de suministro | Usa modelos, plugins, MCP o paquetes de terceros |
| LLM05 Envenenamiento | Entrena o ajusta un modelo, o alimenta una base con datos externos |
| LLM06 Consumo sin límites | Paga una API por uso y la abre a otros usuarios |
| LLM07 Desinformación | Sus respuestas guían decisiones, código o instalaciones |
| LLM08 Contexto oculto | Tiene prompt del sistema con reglas internas o datos privados |
| LLM09 Vectores y embeddings | Usa RAG o una base vectorial |
| LLM10 Manejo de la salida | Muestra, ejecuta o reenvía lo que genera el modelo |

Prioridad entre los activos: primero los que exponen datos o permiten acciones (LLM01, LLM02, LLM03, LLM08), luego costo (LLM06) y luego el resto.

Escala según el momento:
- **Plan o prototipo personal:** una lista corta de los 2 o 3 riesgos activos más graves, con la protección a incluir desde el diseño.
- **Antes de publicar o con usuarios externos:** revisión completa de todos los activos, con evidencia.

### 3 · Revisar cada riesgo activo

En cada riesgo activo, mira la app real (código, prompts, herramientas, permisos) y anota: cumple o falla, con la evidencia. La tabla de abajo da qué pasa y cómo protegerte.

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

### 4 · Entregar el resultado

Un resumen corto para Angel:
1. Perfil del proyecto en dos o tres líneas.
2. Riesgos activos con su estado (cumple o falla) y la corrección propuesta para cada falla, en orden de prioridad.
3. Riesgos descartados en una línea cada uno, con el motivo.

## Verificación

- Cada riesgo tiene estado: cumple, falla o no aplica, y cada «no aplica» nombra el rasgo del perfil que lo descarta.
- Cada falla tiene una corrección propuesta y su prioridad.
- Las claves y credenciales viven en secretos del servidor y quedan fuera de prompts, código del cliente y repositorios.
- Toda herramienta que borra, paga, publica o envía pide confirmación humana.
- Cada API de modelos abierta a otros usuarios tiene topes de gasto y alertas.

## Fuente

- [Carrusel de @chanti.dev en Instagram](https://www.instagram.com/p/DgDpP79kUQo/) · 2026-11-22, basado en el OWASP Top 10 para aplicaciones con LLMs, edición 2026.
