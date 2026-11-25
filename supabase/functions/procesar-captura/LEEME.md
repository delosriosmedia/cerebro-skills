# procesar-captura

**Qué es:** la etapa de procesamiento del motor. Toma cada guardado que llega (por DM de Instagram, por la lista Cerebro de YouTube o por cualquier canal futuro), extrae su contenido completo y deja una primera interpretación lista para la revisión con Angel.

## Recorrido de una captura

| Paso | Estado de la captura | Qué pasa |
| --- | --- | --- |
| 1 | `recibida` | La fuente registra la captura. La función espera 3 minutos para que la nota de Angel alcance a pegarse. |
| 2 | `extrayendo` | `tomar_capturas()` la reserva y suma un intento (máximo 3). |
| 3 | `extrayendo` | Extracción según la plataforma (tabla siguiente). Cada fuente suma una fila en `contenidos`. |
| 4 | `extrayendo` o `interpretando` | Interpretación: tipo, destino, piezas aprovechables y preguntas sugeridas en `interpretaciones` (columna `detalle`). Si la extracción tardó más de 50 s, la interpretación corre en la llamada siguiente con la captura en `interpretando`. |
| 5 | `extraida` | Señal para el hilo de revisión (vista `cola_revision`), que conversa con Angel y propone el cambio. |

Si la extracción falla, la captura vuelve a `recibida` con el motivo en `ultimo_error`; al tercer intento queda en `error`. Un secreto faltante deja la captura esperando sin gastar intentos. Si la interpretación falla tres veces, la captura pasa igual a `extraida` y la revisión interpreta por su cuenta. Las ideas sueltas (`plataforma = 'nota'`) pasan directo a la revisión.

## Rutas de extracción

| Plataforma | Ruta | Resultado en `contenidos` |
| --- | --- | --- |
| YouTube | Gemini recibe el enlace y ve el video (resolución baja). Un video de más de 3,6 minutos se lee en tramos de 3 minutos en paralelo; cada tramo listo queda en `eventos` (etapa `tramo`) y la llamada siguiente lee solo los que faltan. El resultado se une con marcas `[mm:ss–mm:ss]` | `gemini`: transcripción, texto en pantalla, prompts visibles, pasos, herramientas, repos, momentos |
| Instagram por DM | Medio del CDN de Meta → bucket privado `medios` (`capturas/<id>.mp4` o `capturas/<id>-1.jpg`) → Gemini | `gemini`, con `medio_ruta` |
| Instagram, Threads, Facebook por enlace | Apify trae texto, autor, video e imágenes. Las imágenes se guardan en `medios/capturas/<id>-<n>.<ext>` (hasta 10). Gemini lee el video o, si no hay video, las imágenes | `apify` (con `bruto.imagenes`) y `gemini` |
| GitHub | API pública: descripción, README, estrellas, licencia | `github_api` |
| Web | HTML reducido a texto | `otra` |

**Momentos:** cada lectura de Gemini guarda en `bruto.momentos` de 3 a 6 instantes clave (`segundo`, `que_se_ve`) contados desde el inicio del video. En imágenes, `segundo` es el número de imagen. La revisión los usa para señalar dónde se ve cada pieza.

**Animaciones:** cada lectura de video guarda en `bruto.animaciones` las animaciones, transiciones y microinteracciones visibles (`segundo`, `elemento`, `disparador`, `movimiento`, `duracion_ms`, `ritmo`, `efectos`). Los videos descargados se leen a 4 cuadros por segundo (ajuste `gemini_fps_archivo`) para captar movimientos cortos.

**Demanda alta:** ante una respuesta 429 o 503, Gemini se reintenta dos veces (esperas de 4 y 8 s) y luego usa el modelo de respaldo.

## Interpretación

- El intérprete lee el contenido, la tabla `mapa_cerebro` y las reglas activas de `reglas_clasificacion`.
- Devuelve: tipo (`criterio`, `sub_skill`, `skill_nueva`, `prompt`, `repositorio`, `herramienta`, `flujo`, `referencia`), destino en formato `madre/subtema`, acción, confianza, razonamiento.
- `detalle` guarda el título, la ruta del archivo destino, los temas, las piezas aprovechables (prompts literales, criterios, pasos, repos) y de una a tres preguntas sugeridas con su opción recomendada.
- Intérprete por defecto: Gemini (ajuste `interprete = gemini`). Con `interprete = claude` y el secreto `ANTHROPIC_API_KEY`, interpreta Claude.

## Configuración

| Dónde | Clave | Para qué |
| --- | --- | --- |
| Secreto de Edge Functions | `GEMINI_API_KEY` | Video e interpretación (obligatorio) |
| Secreto de Edge Functions | `APIFY_TOKEN` | Posts que llegan solo como enlace |
| Secreto de Edge Functions | `ANTHROPIC_API_KEY` | Interpretación con Claude (opcional) |
| Tabla `ajustes` | `gemini_modelo_video`, `gemini_modelo_interprete` | Modelo de Gemini (por defecto `gemini-flash-latest`) |
| Tabla `ajustes` | `gemini_modelo_respaldo` | Modelo para demanda alta (por defecto `gemini-flash-lite-latest`) |
| Tabla `ajustes` | `gemini_fps_archivo` | Cuadros por segundo al leer videos descargados (por defecto 4) |
| Tabla `ajustes` | `youtube_tramo_s` | Duración de cada tramo de video largo (por defecto 180 s) |
| Tabla `ajustes` | `claude_modelo_interprete` | Modelo de Claude (por defecto `claude-opus-5-5`) |
| Tabla `ajustes` | `apify_actor_<plataforma>`, `apify_entrada_<plataforma>` | Actor de Apify y su entrada (`{url}` se reemplaza) |
| Tabla `ajustes` | `procesar_lote` | Capturas por llamada (por defecto 3) |

## Llamadas

Todas llevan la cabecera `x-cerebro-clave` con el valor de `ajustes.cron_clave`.

- `POST {}`: procesa un lote. `pg_cron` la llama cada 5 minutos cuando hay capturas pendientes.
- `POST {"captura_id": "…"}`: procesa esa captura (pruebas y reprocesos).
- `POST {"captura_id": "…", "solo": "interpretar"}`: repite solo la interpretación.
- `POST {"captura_id": "…", "solo": "video"}`: relee el video guardado en `medios`, actualiza su fila de `contenidos` y repite la interpretación, sin cambiar el estado de la captura.
- `GET ?estado=1`: muestra qué secretos están configurados, sin revelarlos.

Esquema y tarea programada: [`supabase/migrations/0005_procesar_captura.sql`](../../migrations/0005_procesar_captura.sql).
