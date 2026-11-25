---
name: desarrollo-backend
description: Usa esta skill cuando diseñes, construyas o revises una API propia, un servicio de servidor, una función en la nube o un webhook (REST API design, backend, endpoints, pagination, rate limiting, API versioning).
---

# Desarrollo backend

## Propósito

Esta skill reúne los criterios de desarrollo backend guardados y aprobados por el usuario. Sirve como punto de entrada para diseñar APIs propias claras, seguras y fáciles de mantener, junto con los servicios, funciones y webhooks que las sostienen.

## Cómo trabajar con esta skill

1. Identificar qué subtemas toca la tarea.
2. Leer solo los archivos de `criterios/` correspondientes a esos subtemas.
3. Aplicar los criterios encontrados y citar el archivo usado.
4. Seguir la sub-skill correspondiente cuando exista una que cubra la tarea completa.
5. Cuando la tarea aborde un aspecto nuevo que falte en los criterios, trabajar con buen criterio profesional y anotarlo al final como "posible criterio nuevo" para que el usuario decida si se guarda.

## Mapa de criterios

| Archivo | Qué cubre |
| --- | --- |
| `criterios/diseno-apis.md` | Diseño de APIs REST propias: rutas, métodos, idempotencia, paginación, filtros, límites de uso, versionado y autenticación. |

## Relación con otras skills

| Tema | Dónde vive |
| --- | --- |
| Consumir APIs de modelos de IA (costos, límites, caché) | `automatizacion-ia/criterios/apis-modelos.md` |
| Riesgos de seguridad propios de apps con IA | `automatizacion-ia/sub-skills/auditar-seguridad-ia.md` |

## Aviso automático

El hook `plugins/cerebro/hooks/sugerir-diseno-apis.sh` le recuerda a Claude estos criterios cuando un mensaje o un plan aprobado habla de crear o cambiar una API, un endpoint, un webhook o una función en la nube. Avisa una vez por sesión y suma la sub-skill de seguridad cuando la API usa un modelo de IA.

## Sub-skills

Aquí se listan los procedimientos completos de este dominio a medida que se aprueben.

- (ninguna todavía)

## Reglas de mantenimiento

- Cada criterio guarda su fuente (enlace y fecha) en `fuentes.md`.
- Cuando un subtema acumula cinco o más criterios relacionados, se propone ascenderlo a sub-skill.
- Cuando un contenido nuevo contradice un criterio existente, se pregunta al usuario cuál prevalece.
- Los cambios entran como propuesta y se instalan tras la aprobación del usuario.
