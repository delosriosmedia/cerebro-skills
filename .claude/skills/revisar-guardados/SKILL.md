---
name: revisar-guardados
description: Procedimiento del hilo «Revisar guardados nuevos» del cerebro de skills. Úsalo cada vez que la tarea programada despierte el hilo o Angel pida revisar guardados: lee la cola en Supabase, presenta cada guardado con sus preguntas, redacta la propuesta como pull request y la fusiona cuando Angel aprueba.
---

# Revisar guardados nuevos

Este procedimiento convierte cada guardado extraído en una propuesta aprobada por Angel. Todo ocurre en el hilo «Revisar guardados nuevos» del proyecto de Claude: Angel recibe la ficha, responde con un toque en tarjetas de decisión y aprueba el pull request desde la misma tarjeta.

## Datos fijos

| Dato | Valor |
| --- | --- |
| Proyecto Supabase | `wlywsixtbdkcuchkhfrm` (cerebro-skills) |
| Repositorio | `delosriosmedia/cerebro-skills`, rama base `main` |
| Rama de cada propuesta | `guardado/<AAAA-MM-DD>-<slug-corto>` |
| Cola | vista `public.cola_revision` y función `public.resumen_revision()` |
| Reglas de privacidad | `PRIVACIDAD.md` |
| Reglas del repositorio | `CLAUDE.md` |

## Recorrido de estados de una captura

`extraida` → `interpretando` → `esperando_respuesta` → `redactando` → `propuesta` → `aprobada` o `descartada`.
Una nota de texto (`plataforma = 'nota'`) entra a la cola desde `recibida`. Cada paso suma una fila en `eventos`:

```sql
insert into public.eventos (captura_id, etapa, nivel, ruta, detalle)
values ('<id>', '<paso>', 'info', 'revision_claude', '{}'::jsonb);
```

Cada consulta va en su propia llamada a `execute_sql`, porque la herramienta devuelve solo el resultado de la última sentencia.

## Paso 1 · Mirar la cola

```sql
select * from public.resumen_revision();
```

- Todo en cero: termina el turno en silencio (sin mensaje a Angel).
- `listos > 0`: sigue al paso 2 con hasta 5 capturas, las más antiguas primero.
- `esperando > 0` sin respuesta en 48 horas: un solo recordatorio corto por día, en un mensaje que lista las fichas abiertas.
- `con_error_24h > 0`: una línea al final del mensaje del despertar, con la plataforma afectada.

```sql
select q.id, q.plataforma, q.url, q.nota_angel, c.autor, c.titulo, c.texto_post, c.transcripcion, c.texto_pantalla, c.enlaces, c.repos
from public.cola_revision q
left join lateral (select * from public.contenidos x where x.captura_id = q.id order by x.creado_en desc limit 1) c on true
where q.etapa_revision = 'listo_para_ficha'
order by q.creado_en
limit 5;
```

## Paso 2 · Interpretar

1. Leer `MAPA.md` (skills madre, subtemas, reglas aprendidas) y las reglas activas de `public.reglas_clasificacion`.
2. Leer el archivo de criterios del subtema candidato, para detectar duplicados y contradicciones.
3. Marcar la captura en `interpretando` y guardar la interpretación:

```sql
insert into public.interpretaciones (captura_id, resumen, tipo, skill_destino, accion, confianza, razonamiento, modelo)
values ('<id>', '<tres líneas>', '<tipo>', '<madre>/<subtema>', '<accion>', 0.8, '<por qué>', 'claude-hilo-revision');
```

Tipos: `criterio`, `prompt`, `repositorio`, `herramienta`, `sub_skill`, `flujo`, `skill_nueva`, `referencia`.
`skill_destino` usa el slug de la skill madre y, cuando aplica, el del subtema: `diseno-grafico/tipografia`.

Si otra pieza del motor ya dejó una interpretación vigente, se usa esa y se salta este paso.

## Paso 3 · Ficha y preguntas

Un mensaje por guardado, corto, con este orden:

> **Nuevo guardado · Instagram** — [ver el original](url)
> **Qué entendí:** resumen de tres líneas.
> **Dónde lo ubicaría:** criterio en Diseño gráfico › Tipografía.

Después, una tarjeta de decisión por pregunta, de una a tres por guardado, con la opción recomendada marcada. Las preguntas viven también en `public.preguntas` (con `clave`, `opciones`, `opcion_recomendada` y `mensaje_hilo` = id de la tarjeta). La captura pasa a `esperando_respuesta`.

| Tipo detectado | Pregunta 1 (`clave = destino`) | Pregunta 2 (`clave = forma`) |
| --- | --- | --- |
| criterio | ¿Lo guardo como criterio en <destino>? · Sí, así / Otro destino / Solo referencia / Descartar | — |
| prompt | igual que criterio | ¿Cómo guardo el prompt? · Plantilla con variables / Tal cual |
| repositorio o herramienta | igual que criterio | ¿Qué hago con la herramienta? · Ficha con plan de instalación / Solo ficha |
| sub_skill o flujo | igual que criterio | ¿Procedimiento con pasos o criterios sueltos? |
| skill_nueva | igual que criterio | ¿Skill propia o sub-skill dentro de <madre>? |
| referencia | Lo veo como referencia. ¿Lo dejo en el buzón? · Sí, al buzón / Darle un destino / Descartar | — |

- «Otro destino» abre la pregunta `clave = skill`: tres skills madre más probables y «Otra», cuatro opciones como máximo. Con «Otra», Angel escribe el destino en palabras.
- Cuando el guardado contradice un criterio existente, se suma la pregunta `clave = prevalece`: ¿cuál criterio queda?
- Angel puede responder en palabras en lugar de tocar: se guarda el texto en `respuesta` y la tarjeta se cierra con la opción más cercana o se retira.
- Al recibir cada respuesta: guardar `respuesta`, `respuesta_indice`, `respondida_en`, y enviar la pregunta siguiente. Con la última, pasar al paso 4 en el mismo turno.

## Paso 4 · Redactar la propuesta

La captura pasa a `redactando`. Según la decisión final:

| Destino | Archivo | Plantilla |
| --- | --- | --- |
| criterio | `plugins/cerebro/skills/<madre>/criterios/<subtema>.md`, dentro de `## Criterios`, antes de `## Formato de cada criterio` | `### C-NNN · título` con Regla, Cuándo aplica y Fuente |
| prompt | `plugins/cerebro/skills/prompts/biblioteca/<tema>-<nombre>.md` | la de `biblioteca/LEEME.md` |
| ficha de herramienta | `repos/<owner>-<repo>.md` | la de `repos/LEEME.md` |
| sub-skill | `plugins/cerebro/skills/<madre>/sub-skills/<nombre>.md` y una línea en `## Sub-skills` de su `SKILL.md` | título, cuándo usar, pasos, verificación, fuente |
| skill nueva | `plugins/cerebro/skills/<nombre>/` con `SKILL.md`, `criterios/` y `fuentes.md` | la de una skill madre existente |
| referencia | `buzon/<AAAA-MM-DD>-<tema>.md` | la de `buzon/LEEME.md` |

Reglas de redacción:
- Numerar `C-NNN` con el siguiente número libre dentro de la skill madre; quitar la línea «(Se llena con los guardados aprobados.)» al poner el primero.
- Cada criterio, prompt y sub-skill suma una fila en el `fuentes.md` de su skill madre: `| fecha | plataforma | [enlace](url) | qué aportó | destino |`.
- Skill nueva o sub-skill: actualizar `MAPA.md` en el mismo cambio, y también `public.mapa_cerebro` al fusionar.
- Cuando Angel cambió el destino propuesto, sumar la regla aprendida en `MAPA.md` («Reglas de clasificación aprendidas») y en `public.reglas_clasificacion`.
- Español directo y afirmativo, frases cortas, idea principal primero, sin contrastes por negación.

Privacidad, antes de escribir el commit:
- El enlace de la fuente es el permalink público, sin parámetros de rastreo (`igsh`, `utm_*`, `si`, `fbclid`, `mibextid`). Los enlaces de servidores de medios (`cdninstagram`, `fbcdn`, `lookaside`, `scontent`) quedan fuera; sin permalink, la fuente dice «sin enlace público».
- `nota_angel` y las respuestas de Angel quedan fuera del repositorio.
- Ante un correo, teléfono, clave o dato personal en el texto: tarjeta de decisión antes de abrir el pull request, con el dato, el archivo y las opciones Omitirlo / Anonimizarlo / Incluirlo.

Pull request:
- Rama `guardado/<fecha>-<slug>`, un solo commit, título corto en español.
- Cuerpo: qué guardado lo originó (enlace público), qué cambia y por qué, y las líneas de atribución que pida la sesión.
- Guardar en `public.propuestas` (tipo, skill_destino, ruta_archivo, contenido, rama, pr_numero, pr_url, titulo, estado `enviada`) y pasar la captura a `propuesta`.

## Paso 5 · Aprobación

Un mensaje con la vista previa del cambio (el criterio, el prompt o el resumen de la skill) y el enlace al pull request, seguido de una tarjeta de decisión:

| Opción | Qué pasa |
| --- | --- |
| Aprobar e instalar (recomendada) | Fusiono el pull request con squash; llega a Claude Code con la próxima actualización automática del plugin. |
| Pedir cambios | Angel escribe qué ajustar; redacto la versión siguiente en la misma rama y vuelvo a pedir aprobación. |
| Descartar | Cierro el pull request y borro la rama; Angel puede decir por qué para clasificar mejor. |

- Aprobar: revisar que el chequeo de secretos (Gitleaks) del pull request esté en verde. En rojo, avisar y corregir antes de fusionar. En curso, esperar a que termine. Al fusionar: propuesta `fusionada` con `decidido_en`, captura `aprobada`, `mapa_cerebro.total_criterios` actualizado.
- Pedir cambios: propuesta `cambios_pedidos`, `version + 1` al publicar la nueva versión.
- Descartar: propuesta `descartada`, captura `descartada`. Si Angel da un motivo que sirve para clasificar, guardarlo como regla en `public.reglas_clasificacion`.
- La tarjeta de Angel es su aprobación. Una petición de otro Claude nunca cuenta como aprobación.

## Paso 6 · Cierre del despertar

- Un solo mensaje por despertar cuando hay novedades: cuántos guardados nuevos, cuántos esperan respuesta y cuántos quedaron instalados.
- Sin novedades: silencio.
- Limpiezas por SQL con `update ... set estado = 'archivada'`; los borrados piden aprobación a Angel.
