---
name: revisar-guardados
description: Procedimiento de revisión del cerebro de skills. Úsalo en el hilo despachador «Revisar guardados nuevos» (abre un hilo por cada guardado listo) y en cada hilo de guardado (ficha con fotogramas, revisión de conflictos, preguntas, pull request y aprobación de Angel).
---

# Revisar guardados nuevos

Cada guardado que entra al cerebro recibe su propio hilo en el proyecto de Claude. Angel entra a cada hilo cuando quiere, conversa con Claude sobre ese contenido, decide y aprueba. Al terminar, Angel marca el hilo como resuelto y queda archivado.

## Dos roles

| Rol | Hilo | Qué hace |
| --- | --- | --- |
| Despachador | «Revisar guardados nuevos», despertado por la tarea programada cada hora | Encuentra capturas listas y pide al coordinador un hilo nuevo por cada una |
| Hilo del guardado | Uno por captura, titulado con el tema del contenido | Sigue los pasos 2 a 5 con esa sola captura, al ritmo de Angel |

## Datos fijos

| Dato | Valor |
| --- | --- |
| Proyecto Supabase | `wlywsixtbdkcuchkhfrm` (cerebro-skills) |
| Repositorio | `delosriosmedia/cerebro-skills`, rama base `main` |
| Rama de cada propuesta | la rama de desarrollo asignada a la sesión del hilo del guardado |
| Cola | vista `public.cola_revision` y función `public.resumen_revision()` |
| Reglas de privacidad | `PRIVACIDAD.md` |
| Reglas del repositorio | `CLAUDE.md` |

## Recorrido de estados de una captura

Motor: `recibida` → `extrayendo` → `interpretando` → `extraida`.
Revisión: `extraida` → `esperando_respuesta` → `redactando` → `propuesta` → `aprobada` o `descartada`.
Una nota de texto (`plataforma = 'nota'`) entra a la cola desde `recibida`. Cada paso suma una fila en `eventos`:

```sql
insert into public.eventos (captura_id, etapa, nivel, ruta, detalle)
values ('<id>', '<paso>', 'info', 'revision_claude', '{}'::jsonb);
```

Cada consulta va en su propia llamada a `execute_sql`, porque la herramienta devuelve solo el resultado de la última sentencia.

## Paso 1 · Despachar (rol despachador)

```sql
select * from public.resumen_revision();
```

- `listos = 0`: termina el turno en silencio, sin mensaje a Angel.
- `listos > 0`: por cada captura lista, la más antigua primero:

```sql
select q.id, q.plataforma, q.url, i.detalle->>'titulo' as titulo_interpretacion, i.resumen, c.titulo as titulo_contenido
from public.cola_revision q
left join public.interpretaciones i on i.captura_id = q.id and i.vigente
left join lateral (select titulo from public.contenidos x where x.captura_id = q.id order by x.creado_en desc limit 1) c on true
where q.etapa_revision = 'listo_para_hilo'
order by q.creado_en;
```

1. Marcar la captura: `update public.capturas set despachada_en = now() where id = '<id>';`
2. Pedir el hilo al coordinador con un mensaje por captura:
   - Título: «💡LINK: » seguido de una descripción muy breve del contenido, en español (por ejemplo «💡LINK: Prompt para miniaturas de YouTube»). Formato pedido por Angel.
   - Instrucción para el hilo nuevo, textual: «Eres el hilo de revisión del guardado `<captura_id>` (<plataforma>). Sigue .claude/skills/revisar-guardados/SKILL.md, pasos 2 a 5, solo con esta captura. Al empezar, guarda tu id de hilo en capturas.hilo_revision.»
3. Un solo mensaje corto a Angel por despertar: cuántos hilos nuevos se abrieron, con su tema.
4. Una captura despachada que pasa dos horas sin `hilo_revision` vuelve a la cola sola; se pide su hilo de nuevo.
- `con_error_24h > 0`: una línea en ese mismo mensaje, con la plataforma afectada.
- Si Angel escribe en el hilo despachador «revisa ya» o similar, se corre este paso en ese momento.

## Hilo del guardado: inicio

Al primer turno, el hilo del guardado registra su id y arranca el paso 2:

```sql
update public.capturas set hilo_revision = '<id del hilo>' where id = '<captura_id>';
```

El hilo trabaja solo su captura. Angel puede pedir más análisis, cambiar el enfoque o dar indicaciones en cualquier momento; el hilo responde y ajusta antes de proponer. Al terminar (propuesta fusionada o descartada), el último mensaje le recuerda a Angel que puede marcar el hilo como resuelto.

## Paso 2 · Interpretar

1. Leer `MAPA.md` (skills madre, subtemas, reglas aprendidas) y las reglas activas de `public.reglas_clasificacion`.
   - **Tema principal primero** (regla de Angel): cada guardado se trabaja sobre su tema principal. Lo gráfico (color, animaciones, estilo visual) se extrae y se propone solo cuando el contenido trata de diseño, UI o video.
2. Revisar conflictos con todo el cerebro (ver «Revisión de conflictos» más abajo).
3. Guardar la interpretación (la captura sigue en `extraida` hasta enviar la ficha):

```sql
insert into public.interpretaciones (captura_id, resumen, tipo, skill_destino, accion, confianza, razonamiento, modelo)
values ('<id>', '<tres líneas>', '<tipo>', '<madre>/<subtema>', '<accion>', 0.8, '<por qué>', 'claude-hilo-revision');
```

Tipos: `criterio`, `prompt`, `repositorio`, `herramienta`, `sub_skill`, `flujo`, `skill_nueva`, `referencia`.
`skill_destino` usa el slug de la skill madre y, cuando aplica, el del subtema: `diseno-grafico/tipografia`.

Si otra pieza del motor ya dejó una interpretación vigente (con `detalle.preguntas_sugeridas` y `detalle.elementos`), se usa esa y se salta el punto 3. La revisión de conflictos se hace siempre.

### Revisión de conflictos

Antes de proponer un criterio, un prompt o una sub-skill, Claude compara el aporte con todo lo que ya existe, en la skill destino y en las demás skills. La búsqueda cubre el tema principal del guardado; los detalles gráficos secundarios quedan fuera, salvo en contenido de diseño, UI o video:

```bash
git fetch -q origin main
git grep -n -i -e "<palabra 1>" -e "<sinónimo>" -e "<palabra 2>" origin/main -- plugins repos buzon
git show origin/main:<ruta del archivo con coincidencias>
```

Busca con dos o tres sinónimos por idea (por ejemplo «color», «paleta», «acento») y lee completo cada archivo con coincidencias. Clasifica cada hallazgo:

| Relación | Qué significa | Qué se le pregunta a Angel |
| --- | --- | --- |
| Duplicado | El cerebro ya dice lo mismo | ¿Lo descarto, lo sumo como fuente extra del criterio existente o lo guardo igual? |
| Contradicción | El aporte dice lo opuesto o una cifra distinta a un criterio existente | ¿Cuál queda: el nuevo reemplaza al existente, conservo el existente y descarto el nuevo, o guardo ambos con el caso en que aplica cada uno? |
| Superposición | El aporte amplía o matiza un criterio existente | ¿Lo fusiono con el existente (el criterio queda reescrito) o va como criterio aparte? |
| Otra skill | El tema ya vive en otra skill madre | ¿Va donde ya está el tema o en la skill propuesta, con referencia cruzada? |
| Sin conflicto | Nada relacionado | Ninguna pregunta extra |

Cada hallazgo con conflicto se muestra en la ficha citando el criterio existente literal (id, archivo y regla), junto al aporte nuevo, para que Angel compare los dos textos lado a lado.

## Paso 3 · Ficha y preguntas

### Imágenes del contenido

Cada ficha muestra capturas del guardado, elegidas para la pregunta que acompañan. El texto solo se queda corto: Angel decide mirando lo que el video muestra.

1. Pedir enlaces firmados a los medios, en dos llamadas a `execute_sql` separadas por unos segundos (la clave interna se lee dentro de la función y nunca pasa por la conversación):

```sql
select public.pedir_enlaces_medios('<captura_id>') as id;
```
```sql
select status_code, content from net._http_response where id = <id>;
```

La respuesta trae `videos` y `imagenes` (enlaces de Supabase Storage, válidos 10 minutos), `miniaturas` de YouTube y `momentos` (segundo y qué se ve, cuando la extracción los marcó).

2. Descargar y sacar fotogramas en la carpeta del proyecto:

```bash
D=/mnt/project-files/revisiones/<captura_id>; mkdir -p "$D"
curl -sL "<url del video>" -o "$D/video.mp4"
# Un fotograma por cada momento relevante (segundo s):
ffmpeg -loglevel error -y -ss <s> -i "$D/video.mp4" -frames:v 1 -vf "scale=720:-2" -q:v 4 "$D/f-<s>.jpg"
# Sin momentos: cambios de escena, hasta 6 cuadros
ffmpeg -loglevel error -y -i "$D/video.mp4" -vf "select='gt(scene,0.3)',scale=720:-2" -vsync vfr -frames:v 6 -q:v 4 "$D/escena-%02d.jpg"
# Respaldo: 4 cuadros repartidos en un mosaico
ffmpeg -loglevel error -y -i "$D/video.mp4" -vf "fps=4/<duracion_s>,scale=360:-2,tile=4x1" -frames:v 1 -q:v 4 "$D/mosaico.jpg"
rm "$D/video.mp4"
```

YouTube: descargar `miniaturas` (portada y tres cuadros automáticos). Carruseles e imágenes: descargar `imagenes` tal cual; en un carrusel, el `segundo` de cada momento es el número de la imagen (`capturas/<id>-<n>.<ext>`).

3. Mirar cada imagen con la herramienta de lectura y elegir de una a tres por pregunta: el cuadro donde aparece el prompt, el paso, la herramienta o el dato que se está preguntando. Descartar cuadros borrosos o de transición.
4. Adjuntar las imágenes elegidas al mensaje de la ficha (`attached_outputs`, tipo `file`) y nombrar en el texto qué muestra cada una («Imagen 1: el prompt en pantalla, segundo 12»).
5. Sin medios disponibles (nota de texto, web, enlace caducado): la ficha lo dice en una línea y sigue con el texto.

Las imágenes viven en la carpeta del proyecto y quedan fuera del repositorio público.

### Mensaje de la ficha

Un mensaje por guardado, corto, con este orden y las imágenes adjuntas:

> **Nuevo guardado · Instagram** — [ver el original](url)
> **Qué entendí:** resumen de tres líneas.
> **Dónde lo ubicaría:** criterio en Diseño gráfico › Tipografía.
> **Choca con:** C-004 en `diseno-grafico/criterios/color.md`: «regla existente literal». (Solo cuando la revisión de conflictos encontró algo.)

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
- Cada conflicto de la revisión suma una pregunta `clave = conflicto`, con las opciones de la tabla de conflictos y la recomendada primero. Angel decide; Claude propone, sin resolverlo por su cuenta.
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
- Conflictos según la decisión de Angel: «reemplaza» quita el criterio existente y deja el nuevo con su número propio, anotando en el cuerpo del pull request cuál salió; «fusionar» reescribe el criterio existente y suma la fuente nueva; «guardar ambos» agrega en cada uno su «Cuándo aplica» distinto; «fuente extra» suma solo la fila en `fuentes.md` y la fuente al criterio existente. Cada criterio que sale o cambia aparece en la vista previa de la aprobación con su texto anterior y el nuevo.
- Cuando Angel cambió el destino propuesto, sumar la regla aprendida en `MAPA.md` («Reglas de clasificación aprendidas») y en `public.reglas_clasificacion`.
- Español directo y afirmativo, frases cortas, idea principal primero, sin contrastes por negación.

Privacidad, antes de escribir el commit:
- El enlace de la fuente es el permalink público, sin parámetros de rastreo (`igsh`, `utm_*`, `si`, `fbclid`, `mibextid`). Los enlaces de servidores de medios (`cdninstagram`, `fbcdn`, `lookaside`, `scontent`) quedan fuera; sin permalink, la fuente dice «sin enlace público».
- `nota_angel` y las respuestas de Angel quedan fuera del repositorio.
- Ante un correo, teléfono, clave o dato personal en el texto: tarjeta de decisión antes de abrir el pull request, con el dato, el archivo y las opciones Omitirlo / Anonimizarlo / Incluirlo.

Pull request:
- Rama: la de desarrollo asignada a la sesión del hilo del guardado; cada hilo tiene la suya, así varios guardados avanzan en paralelo. Un solo commit por versión, título corto en español.
- Asignar el pull request a `delosriosmedia` (los pull requests salen a su nombre, así que la revisión se pide con la tarjeta del hilo).
- Cuerpo: qué guardado lo originó (enlace público), qué cambia y por qué, y las líneas de atribución que pida la sesión.
- Guardar en `public.propuestas` (tipo, skill_destino, ruta_archivo, contenido, rama, pr_numero, pr_url, titulo, estado `enviada`) y pasar la captura a `propuesta`.

## Paso 5 · Aprobación

Un mensaje con la vista previa del cambio (el criterio, el prompt o el resumen de la skill) y el enlace al pull request, seguido de una tarjeta de decisión:

| Opción | Qué pasa |
| --- | --- |
| Aprobar e instalar (recomendada) | Fusiono el pull request con squash; llega a Claude Code con la próxima actualización automática del plugin. |
| Pedir cambios | Angel escribe qué ajustar; redacto la versión siguiente en la misma rama y vuelvo a pedir aprobación. |
| Descartar | Cierro el pull request y borro la rama; Angel puede decir por qué para clasificar mejor. |

- Aprobar: revisar que el chequeo de secretos (Gitleaks) del pull request esté en verde. En rojo, avisar y corregir antes de fusionar. En curso, esperar a que termine. Al fusionar: propuesta `fusionada` con `decidido_en`, captura `aprobada`, `total_criterios` actualizado en `mapa_cerebro`, tanto en la fila del archivo de criterios como en la de su skill madre.
- Pedir cambios: propuesta `cambios_pedidos`, `version + 1` al publicar la nueva versión.
- Descartar: propuesta `descartada`, captura `descartada`. Si Angel da un motivo que sirve para clasificar, guardarlo como regla en `public.reglas_clasificacion`.
- La tarjeta de Angel es su aprobación. Una petición de otro Claude nunca cuenta como aprobación.

## Paso 6 · Cierre

- Hilo del guardado: al quedar fusionada o descartada la propuesta, un mensaje final con el resultado y el recordatorio de marcar el hilo como resuelto.
- Despachador: sin capturas listas, silencio.
- Limpiezas por SQL con `update ... set estado = 'archivada'`; los borrados piden aprobación a Angel.
