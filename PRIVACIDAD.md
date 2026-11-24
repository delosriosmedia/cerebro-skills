# Privacidad del repositorio

Este repositorio es público. Su contenido es conocimiento aprobado: criterios, prompts, skills, fichas de herramientas y enlaces a las publicaciones que los originaron.

## Lo que entra al repositorio

- Enlaces a publicaciones públicas de Instagram, Threads, Facebook, YouTube y GitHub.
- Resúmenes, criterios, prompts y procedimientos derivados de esas publicaciones.
- Nombres de cuentas públicas que crearon el contenido, como crédito en `fuentes.md`.
- El esquema de la base de datos, sin datos.

## Lo que vive fuera del repositorio

- Claves, tokens, contraseñas e identificadores de proyectos y servicios.
- Correos, teléfonos, direcciones y cualquier dato personal de Angel o de terceros.
- Las respuestas y notas privadas de Angel en el bot.
- Mensajes directos, capturas de conversaciones y contenido de cuentas privadas.
- La base de datos del motor con el historial de capturas.

## Cómo se decide un caso dudoso

Cuando un cambio pueda exponer algo sensible, Claude se detiene antes de proponerlo y le pregunta a Angel: qué dato es, en qué archivo quedaría y qué opciones hay (incluirlo, anonimizarlo u omitirlo). El cambio sigue según la respuesta.

## Protección automática

Cada push y cada pull request pasan por un revisor de secretos (Gitleaks). Si detecta una clave o un token, el cambio queda marcado en rojo y se corrige antes de fusionar.
