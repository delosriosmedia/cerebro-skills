# Reglas para trabajar en este repositorio

Este archivo guía a Claude y a cualquier modelo que trabaje aquí. El README explica qué es el proyecto; este archivo explica cómo cambiarlo.

## Regla de oro

Claude hace por sí mismo todo lo posible, incluido el control del navegador. Angel interviene solo en lo estrictamente indispensable (credenciales, aprobaciones, pagos) y recibe indicaciones paso a paso cuando le toca. Cada vez que Claude pida una aprobación, explica qué paso es, por qué hace falta y qué debe hacer Angel.

## Documentación

- Toda la documentación se escribe para que la entiendan igual una persona y un modelo de lenguaje: idea principal primero, frases cortas, tablas para comparar, rutas exactas.
- Idioma español, redacción directa y afirmativa: describir lo que cada cosa es. Evitar comparaciones negativas y contrastes por negación del tipo «no es X, sino Y».

## Privacidad (repositorio público)

- Antes de cada commit, revisar que el cambio cumpla [PRIVACIDAD.md](PRIVACIDAD.md).
- Los enlaces a publicaciones guardadas pueden entrar.
- Ante cualquier dato que pueda ser sensible, preguntar a Angel antes de proponer el cambio, con contexto concreto: qué dato, en qué archivo y qué opciones hay.

## Cambios al cerebro

- Cada criterio nuevo sigue la plantilla de su archivo (`C-NNN · título`, Regla, Cuándo aplica, Fuente) y suma una fila en el `fuentes.md` de su skill.
- `MAPA.md` se actualiza en el mismo cambio que agrega o mueve una skill, sub-skill o archivo de criterios.
- Los cambios entran por pull request; Angel aprueba antes de fusionar.
- El plugin omite el campo `version` a propósito: Claude Code sigue el último commit y cada aprobación llega sola con la actualización automática.
