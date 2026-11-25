// youtube-lista: revisa la lista de reproducción «Cerebro» de Angel en YouTube
// y registra cada video nuevo como captura del cerebro.
//
// Cómo funciona:
// - pg_cron la llama cada 10 minutos (migración 0003) con la cabecera x-cerebro-clave.
// - Lee la lista con la YouTube Data API v3 (playlistItems + videos) usando una clave de API.
//   La lista es «no listada», así que basta la clave; OAuth queda fuera.
// - Cada video nuevo entra a public.capturas (canal youtube_lista, estado recibida) y sus datos
//   (título, canal, descripción, duración, enlaces, repos) a public.contenidos.
// - Un video ya registrado por cualquier canal se reconoce por url_normalizada = youtube:video:<id>.
// - GET ?estado=1 devuelve un diagnóstico sin secretos.
//
// Secreto (Supabase > Edge Functions > Secrets): YOUTUBE_API_KEY.
// Ajustes (tabla public.ajustes): youtube_lista_id, cron_clave, youtube_ultima_revision.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const API_KEY = Deno.env.get("YOUTUBE_API_KEY") ?? "";
const API = "https://www.googleapis.com/youtube/v3";
const MAX_PAGINAS = 20; // 1000 videos por revisión

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });

async function ajuste(clave: string): Promise<string | null> {
  const { data } = await db.from("ajustes").select("valor").eq("clave", clave).maybeSingle();
  return data?.valor ?? null;
}

async function evento(etapa: string, nivel: "info" | "aviso" | "error", detalle: unknown, captura_id: string | null = null) {
  await db.from("eventos").insert({ captura_id, etapa, nivel, ruta: "youtube_api", detalle });
}

async function youtube(recurso: string, params: Record<string, string>) {
  const url = new URL(`${API}/${recurso}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", API_KEY);
  const r = await fetch(url);
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${recurso} ${r.status}: ${cuerpo?.error?.message ?? "sin detalle"}`);
  return cuerpo;
}

// PT1H2M3S -> 3723
function segundos(iso: string | undefined): number | null {
  const m = iso?.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return null;
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

const enlacesDe = (texto: string): string[] => [...new Set(texto.match(/https?:\/\/[^\s<>"')\]]+/g) ?? [])];
const reposDe = (enlaces: string[]): string[] =>
  [...new Set(enlaces.map((e) => e.match(/^https?:\/\/(?:www\.)?github\.com\/([\w.-]+\/[\w.-]+)/)?.[1]).filter(Boolean) as string[])]
    .map((r) => r.replace(/\.git$/, ""));

type Elemento = { videoId: string; nota: string | null; agregado: string | null; elementoId: string };

async function leerLista(listaId: string): Promise<Elemento[]> {
  const elementos: Elemento[] = [];
  let pagina: string | undefined;
  for (let i = 0; i < MAX_PAGINAS; i++) {
    const r = await youtube("playlistItems", {
      part: "snippet,contentDetails",
      playlistId: listaId,
      maxResults: "50",
      ...(pagina ? { pageToken: pagina } : {}),
    });
    for (const it of r.items ?? []) {
      const videoId = it.contentDetails?.videoId;
      if (!videoId) continue;
      elementos.push({
        videoId,
        nota: it.contentDetails?.note?.trim() || null,
        agregado: it.snippet?.publishedAt ?? null,
        elementoId: it.id,
      });
    }
    pagina = r.nextPageToken;
    if (!pagina) break;
  }
  return elementos;
}

async function detalles(ids: string[]): Promise<Map<string, any>> {
  const mapa = new Map<string, any>();
  for (let i = 0; i < ids.length; i += 50) {
    const r = await youtube("videos", { part: "snippet,contentDetails,status", id: ids.slice(i, i + 50).join(",") });
    for (const v of r.items ?? []) mapa.set(v.id, v);
  }
  return mapa;
}

async function revisar() {
  if (!API_KEY) return { ok: false, motivo: "falta el secreto YOUTUBE_API_KEY" };
  const listaId = await ajuste("youtube_lista_id");
  if (!listaId) return { ok: false, motivo: "falta el ajuste youtube_lista_id" };

  const elementos = await leerLista(listaId);
  const claves = elementos.map((e) => `youtube:video:${e.videoId}`);
  const existentes = new Set<string>();
  for (let i = 0; i < claves.length; i += 200) {
    const { data } = await db.from("capturas").select("url_normalizada").in("url_normalizada", claves.slice(i, i + 200));
    for (const f of data ?? []) existentes.add(f.url_normalizada);
  }
  const nuevos = elementos.filter((e) => !existentes.has(`youtube:video:${e.videoId}`));
  const info = nuevos.length ? await detalles(nuevos.map((e) => e.videoId)) : new Map();

  let registrados = 0, omitidos = 0;
  for (const e of nuevos) {
    const v = info.get(e.videoId);
    if (!v) { omitidos++; continue; } // video privado o eliminado: la API no lo devuelve
    const s = v.snippet ?? {};
    const descripcion = String(s.description ?? "");
    const enlaces = enlacesDe(descripcion);
    const { data, error } = await db.from("capturas").insert({
      canal: "youtube_lista",
      plataforma: "youtube",
      url: `https://www.youtube.com/watch?v=${e.videoId}`,
      url_normalizada: `youtube:video:${e.videoId}`,
      nota_angel: e.nota,
      ruta_extraccion: "youtube_api",
      mensaje_origen_id: `youtube_lista:${e.elementoId}`,
    }).select("id").single();
    if (error) {
      if (error.code !== "23505") await evento("guardar_captura", "error", { video: e.videoId, codigo: error.code, mensaje: error.message });
      continue;
    }
    await db.from("contenidos").insert({
      captura_id: data.id,
      fuente_extraccion: "youtube_api",
      autor: s.channelTitle ?? null,
      titulo: s.title ?? null,
      texto_post: descripcion || null,
      enlaces,
      repos: reposDe(enlaces),
      duracion_s: segundos(v.contentDetails?.duration),
      idioma: s.defaultAudioLanguage ?? s.defaultLanguage ?? null,
      bruto: {
        video_id: e.videoId,
        canal_id: s.channelId ?? null,
        publicado_en: s.publishedAt ?? null,
        agregado_a_lista_en: e.agregado,
        etiquetas: s.tags ?? [],
        subtitulos: v.contentDetails?.caption === "true",
        miniatura: s.thumbnails?.high?.url ?? s.thumbnails?.default?.url ?? null,
      },
    });
    await evento("captura_recibida", "info", { plataforma: "youtube" }, data.id);
    registrados++;
  }

  await db.from("ajustes").upsert({ clave: "youtube_ultima_revision", valor: new Date().toISOString() });
  if (registrados || omitidos) await evento("revisar_lista_youtube", "info", { en_lista: elementos.length, registrados, omitidos });
  return { ok: true, en_lista: elementos.length, registrados, omitidos };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.get("estado")) {
    return json({
      clave_api_configurada: Boolean(API_KEY),
      lista_configurada: Boolean(await ajuste("youtube_lista_id")),
      ultima_revision: await ajuste("youtube_ultima_revision"),
    });
  }
  if (req.method !== "POST") return new Response("cerebro: youtube-lista activo", { status: 200 });

  const clave = await ajuste("cron_clave");
  if (!clave || req.headers.get("x-cerebro-clave") !== clave) return new Response("no autorizado", { status: 401 });

  try {
    return json(await revisar());
  } catch (e) {
    await evento("revisar_lista_youtube", "error", { mensaje: String(e) });
    return json({ ok: false, motivo: String(e) }, 500);
  }
});
