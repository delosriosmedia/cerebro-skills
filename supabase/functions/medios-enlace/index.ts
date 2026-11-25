// medios-enlace: entrega enlaces firmados (10 minutos) a los medios de una captura.
// Lo usa el hilo de revisión para sacar fotogramas del video y mostrarlos en cada ficha.
//
// Llamada: POST {"captura_id": "…"} con cabecera x-cerebro-clave = ajustes.cron_clave.
// El hilo la llama desde SQL con public.pedir_enlaces_medios(captura_id), así la clave
// nunca pasa por la conversación.
//
// Respuesta: {"videos": [{ruta, url}], "imagenes": [{ruta, url}], "youtube_id": "…" | null,
//             "miniaturas": [url…], "momentos": [{segundo, que_se_ve}]}

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });

function idYoutube(url: string | null, normalizada: string | null): string | null {
  if (normalizada?.startsWith("youtube:video:")) return normalizada.slice(14);
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

Deno.serve(async (req) => {
  const { data: clave } = await db.from("ajustes").select("valor").eq("clave", "cron_clave").maybeSingle();
  if (!clave?.valor || req.headers.get("x-cerebro-clave") !== clave.valor) return json({ error: "no autorizado" }, 401);

  const { captura_id } = await req.json().catch(() => ({}));
  if (!captura_id) return json({ error: "falta captura_id" }, 400);

  const { data: captura } = await db.from("capturas").select("id, url, url_normalizada").eq("id", captura_id).maybeSingle();
  if (!captura) return json({ error: "captura inexistente" }, 404);

  const { data: contenidos } = await db.from("contenidos").select("medio_ruta, bruto").eq("captura_id", captura_id);
  const rutas = new Set<string>();
  const momentos: unknown[] = [];
  for (const c of contenidos ?? []) {
    if (c.medio_ruta) rutas.add(c.medio_ruta);
    const b = (c.bruto ?? {}) as Record<string, unknown>;
    if (Array.isArray(b.momentos)) momentos.push(...b.momentos);
  }
  // Imágenes guardadas junto al video: capturas/<id>-N.jpg, capturas/<id>.jpg
  const { data: lista } = await db.storage.from("medios").list("capturas", { search: captura_id });
  for (const o of lista ?? []) rutas.add(`capturas/${o.name}`);

  const videos: { ruta: string; url: string }[] = [];
  const imagenes: { ruta: string; url: string }[] = [];
  for (const ruta of rutas) {
    const { data } = await db.storage.from("medios").createSignedUrl(ruta, 600);
    if (!data?.signedUrl) continue;
    (/\.(jpe?g|png|webp|gif)$/i.test(ruta) ? imagenes : videos).push({ ruta, url: data.signedUrl });
  }

  const yt = idYoutube(captura.url, captura.url_normalizada);
  const miniaturas = yt
    ? ["maxresdefault", "hq1", "hq2", "hq3"].map((n) => `https://i.ytimg.com/vi/${yt}/${n}.jpg`)
    : [];

  await db.from("eventos").insert({ captura_id, etapa: "enlaces_medios", nivel: "info", ruta: "revision_claude", detalle: { videos: videos.length, imagenes: imagenes.length, youtube: Boolean(yt) } });
  return json({ videos, imagenes, youtube_id: yt, miniaturas, momentos });
});
