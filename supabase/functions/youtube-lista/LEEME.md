# Función `youtube-lista`

**Qué hace:** cada 10 minutos lee la lista de reproducción «Cerebro» de Angel en YouTube y registra cada video nuevo como captura del cerebro, con su título, canal, descripción, duración, enlaces y repositorios de GitHub.

## Cómo usarla (Angel)

1. En YouTube, toca **Guardar** debajo de cualquier video y marca la lista **Cerebro**.
2. Opcional: en la lista, abre el menú del video y elige **Agregar/editar nota**. La nota llega al cerebro como `nota_angel` y guía la interpretación.
3. En menos de 10 minutos el video aparece en `capturas` con estado `recibida`.

La lista es **no listada**: solo la ve quien tenga el enlace. Así basta una clave de API para leerla, sin inicios de sesión que caduquen.

## Recorrido de un video

| Paso | Dónde queda |
| --- | --- |
| pg_cron llama a la función cada 10 minutos con la cabecera `x-cerebro-clave` | `cron.job` (`youtube-lista`) |
| La función lee la lista con `playlistItems` y los detalles con `videos` (YouTube Data API v3) | — |
| Cada video nuevo entra con `canal = youtube_lista`, `plataforma = youtube`, `url_normalizada = youtube:video:<id>` | `capturas` |
| Título, canal, descripción, duración, idioma, enlaces y repos | `contenidos` (`fuente_extraccion = youtube_api`) |
| Cada captura nueva y cada error | `eventos` (`ruta = youtube_api`) |

`url_normalizada` usa el mismo formato que el canal de Instagram, así un video llega una sola vez aunque Angel lo guarde en la lista y también lo envíe por mensaje.

## Configuración

| Dato | Dónde vive |
| --- | --- |
| `YOUTUBE_API_KEY`: clave restringida a YouTube Data API v3 (proyecto de Google Cloud `cerebro-skills`) | Supabase › Edge Functions › Secrets |
| `youtube_lista_id`, `funciones_url`, `cron_clave` | tabla `public.ajustes` |
| `youtube_ultima_revision` | tabla `public.ajustes`, la escribe la función |

Diagnóstico sin secretos: `GET <funciones_url>/youtube-lista?estado=1`.

## Costo

Cada revisión gasta unas 2 unidades de cuota por cada 50 videos; la cuota gratuita diaria es de 10 000 unidades. A 144 revisiones por día, la lista puede crecer a miles de videos sin pasar del plan gratuito.

## Límites conocidos

- Los videos privados o eliminados de la lista se omiten y se cuentan en el evento `revisar_lista_youtube`.
- La transcripción queda para la etapa de extracción (Gemini), porque YouTube bloquea los subtítulos desde servidores en la nube.
