// instagram-webhook: recibe los mensajes que Angel envía por Instagram a su chat de captura
// (un chat que usa solo para guardar ideas) y los registra como capturas del cerebro.
//
// Cómo funciona:
// - GET con hub.* : verificación del webhook que hace Meta al configurarlo.
// - GET ?estado=1 : diagnóstico sin secretos (qué está configurado).
// - GET ?accion=suscribir : suscribe la cuenta conectada al campo "messages".
// - POST : eventos de Meta. Se valida la firma X-Hub-Signature-256 con META_APP_SECRET
//   (o con el ajuste "firma_prueba" para pruebas internas).
//   Solo se guardan los mensajes ENVIADOS por la cuenta conectada (is_echo) al chat destino.
//   Todo lo demás (mensajes recibidos, otros chats) se descarta sin guardarse.
//
// Secretos (Supabase > Edge Functions > Secrets): META_APP_SECRET, IG_ACCESS_TOKEN.
// Ajustes no secretos (tabla public.ajustes): instagram_destino_usuario, instagram_destino_igsid.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") ?? "cerebro-skills";
const APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";
const IG_TOKEN = Deno.env.get("IG_ACCESS_TOKEN") ?? "";
const GRAPH = "https://graph.instagram.com";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const descartados = new Set<string>(); // ids de chats que no son el destino (cache por worker)

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });

async function evento(etapa: string, nivel: "info" | "aviso" | "error", detalle: unknown, captura_id: string | null = null) {
  await db.from("eventos").insert({ captura_id, etapa, nivel, ruta: "dm_instagram", detalle });
}

async function ajuste(clave: string): Promise<string | null> {
  const { data } = await db.from("ajustes").select("valor").eq("clave", clave).maybeSingle();
  return data?.valor ?? null;
}

async function firmaCon(secreto: string, cuerpo: string, recibida: string): Promise<boolean> {
  const clave = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const firma = new Uint8Array(await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(cuerpo)));
  const esperada = Array.from(firma).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (esperada.length !== recibida.length) return false;
  let diferencia = 0;
  for (let i = 0; i < esperada.length; i++) diferencia |= esperada.charCodeAt(i) ^ recibida.charCodeAt(i);
  return diferencia === 0;
}

// Acepta la firma de Meta (META_APP_SECRET) y, para pruebas internas, la clave del ajuste
// "firma_prueba" (solo editable con acceso a la base; vacía = desactivada).
async function firmaValida(cuerpo: string, cabecera: string | null): Promise<boolean> {
  if (!cabecera?.startsWith("sha256=")) return false;
  const recibida = cabecera.slice(7);
  if (APP_SECRET && await firmaCon(APP_SECRET, cuerpo, recibida)) return true;
  const prueba = await ajuste("firma_prueba");
  return Boolean(prueba) && await firmaCon(prueba!, cuerpo, recibida);
}

// ¿El destinatario del mensaje es el chat de captura (ajuste instagram_destino_usuario)?
async function esDestino(idDestinatario: string): Promise<boolean> {
  const fijo = await ajuste("instagram_destino_igsid");
  if (fijo) return fijo === idDestinatario;
  if (descartados.has(idDestinatario) || !IG_TOKEN) return false;
  const usuario = (await ajuste("instagram_destino_usuario"))?.toLowerCase();
  if (!usuario) return false;
  const r = await fetch(`${GRAPH}/${idDestinatario}?fields=username&access_token=${IG_TOKEN}`);
  if (!r.ok) {
    await evento("resolver_destino", "aviso", { status: r.status });
    return false;
  }
  const perfil = await r.json();
  if (String(perfil.username ?? "").toLowerCase() === usuario) {
    await db.from("ajustes").upsert({ clave: "instagram_destino_igsid", valor: idDestinatario });
    await evento("resolver_destino", "info", { resuelto: true });
    return true;
  }
  descartados.add(idDestinatario);
  return false;
}

function plataformaDe(url: string): string {
  const host = new URL(url).hostname.replace(/^(www|m|mobile)\./, "");
  if (host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("threads.net") || host.endsWith("threads.com")) return "threads";
  if (host.endsWith("facebook.com") || host === "fb.watch") return "facebook";
  if (host.endsWith("youtube.com") || host === "youtu.be") return "youtube";
  if (host === "github.com") return "github";
  return "web";
}

// Clave única por pieza. YouTube usa "youtube:video:<id>" para que la lista Cerebro y un enlace
// enviado por mensaje se reconozcan como la misma captura.
function normalizar(url: string): string {
  const u = new URL(url);
  const host = u.hostname.replace(/^(www|m|mobile|music)\./, "");
  const youtube = host === "youtu.be"
    ? u.pathname.slice(1).split("/")[0]
    : host.endsWith("youtube.com")
    ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|live|embed)\/([^/?]+)/)?.[1] ?? "")
    : "";
  if (youtube) return `youtube:video:${youtube}`;
  u.hash = "";
  for (const p of ["igsh", "igshid", "utm_source", "utm_medium", "utm_campaign", "si", "fbclid", "feature", "mibextid"]) {
    u.searchParams.delete(p);
  }
  u.hostname = u.hostname.replace(/^(www|m|mobile)\./, "");
  return u.toString().replace(/\/$/, "");
}

const enlacesDe = (texto: string): string[] => texto.match(/https?:\/\/[^\s<>"']+/g) ?? [];

type Adjunto = { type?: string; payload?: Record<string, unknown> };

async function guardarCaptura(fila: Record<string, unknown>, contenido: Record<string, unknown> | null) {
  const { data, error } = await db.from("capturas").insert(fila).select("id").single();
  if (error) {
    if (error.code === "23505") return; // ya registrada (evento repetido o enlace repetido)
    await evento("guardar_captura", "error", { codigo: error.code, mensaje: error.message });
    return;
  }
  if (contenido) await db.from("contenidos").insert({ captura_id: data.id, fuente_extraccion: "dm_instagram", ...contenido });
  await evento("captura_recibida", "info", { plataforma: fila.plataforma }, data.id);
}

async function procesarMensaje(m: Record<string, any>) {
  const mensaje = m.message;
  if (!mensaje?.is_echo || mensaje.is_deleted) return; // solo lo que Angel envía
  const destinatario = String(m.recipient?.id ?? "");
  if (!destinatario || !(await esDestino(destinatario))) return;

  const mid = String(mensaje.mid ?? "");
  const texto = String(mensaje.text ?? "").trim();
  const adjuntos: Adjunto[] = Array.isArray(mensaje.attachments) ? mensaje.attachments : [];

  // 1) Posts, reels y archivos compartidos
  for (const [i, a] of adjuntos.entries()) {
    const p = a.payload ?? {};
    const mediaId = String(p.ig_post_media_id ?? p.reel_video_id ?? "");
    const url = typeof p.url === "string" ? p.url : null;
    const esPost = ["ig_post", "share", "ig_reel", "reel"].includes(String(a.type));
    const plataforma = esPost ? "instagram" : "archivo";
    await guardarCaptura(
      {
        canal: "dm_instagram",
        plataforma,
        url,
        url_normalizada: mediaId ? `instagram:media:${mediaId}` : null,
        nota_angel: texto || null,
        ruta_extraccion: "dm_instagram",
        mensaje_origen_id: `${mid}#${i}`,
      },
      { texto_post: (p.title as string) ?? null, enlaces: enlacesDe(texto), bruto: { tipo: a.type, payload: p } },
    );
  }
  if (adjuntos.length) return;

  // 2) Enlaces pegados como texto (YouTube, Threads, Facebook, GitHub, web)
  const enlaces = enlacesDe(texto);
  if (enlaces.length) {
    for (const [i, url] of enlaces.entries()) {
      let plataforma = "web", normal: string | null = null;
      try { plataforma = plataformaDe(url); normal = normalizar(url); } catch { /* enlace mal formado */ }
      await guardarCaptura(
        {
          canal: "dm_instagram", plataforma, url, url_normalizada: normal,
          nota_angel: texto.replace(url, "").trim() || null,
          ruta_extraccion: "dm_instagram", mensaje_origen_id: `${mid}#${i}`,
        },
        { enlaces: [url] },
      );
    }
    return;
  }

  // 3) Texto suelto: si sigue a una captura reciente (3 min), es la nota de esa captura
  if (!texto) return;
  const hace3min = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data: previa } = await db.from("capturas")
    .select("id").eq("canal", "dm_instagram").is("nota_angel", null).neq("plataforma", "nota")
    .gte("creado_en", hace3min).order("creado_en", { ascending: false }).limit(1).maybeSingle();
  if (previa) {
    await db.from("capturas").update({ nota_angel: texto }).eq("id", previa.id);
    await evento("nota_agregada", "info", {}, previa.id);
    return;
  }
  await guardarCaptura(
    { canal: "dm_instagram", plataforma: "nota", nota_angel: texto, ruta_extraccion: "dm_instagram", mensaje_origen_id: mid },
    null,
  );
}

async function suscribir() {
  if (!IG_TOKEN) return { ok: false, motivo: "falta IG_ACCESS_TOKEN" };
  const r = await fetch(`${GRAPH}/me/subscribed_apps?subscribed_fields=messages&access_token=${IG_TOKEN}`, { method: "POST" });
  const cuerpo = await r.json().catch(() => ({}));
  await evento("suscribir_webhook", r.ok ? "info" : "error", { status: r.status, respuesta: cuerpo });
  return { ok: r.ok, status: r.status, respuesta: cuerpo };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("hub.mode") === "subscribe") {
      if (url.searchParams.get("hub.verify_token") !== VERIFY_TOKEN) return new Response("token incorrecto", { status: 403 });
      await evento("verificacion_meta", "info", {});
      return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
    }
    if (url.searchParams.get("accion") === "suscribir") return json(await suscribir());
    if (url.searchParams.get("estado")) {
      return json({
        firma_configurada: Boolean(APP_SECRET),
        token_configurado: Boolean(IG_TOKEN),
        destino_usuario: await ajuste("instagram_destino_usuario"),
        destino_resuelto: Boolean(await ajuste("instagram_destino_igsid")),
      });
    }
    return new Response("cerebro: instagram-webhook activo", { status: 200 });
  }

  if (req.method !== "POST") return new Response("método no admitido", { status: 405 });

  const cuerpo = await req.text();
  if (!(await firmaValida(cuerpo, req.headers.get("x-hub-signature-256")))) {
    await evento("firma_invalida", "aviso", { configurada: Boolean(APP_SECRET) });
    return new Response("firma inválida", { status: 401 });
  }

  try {
    const datos = JSON.parse(cuerpo);
    for (const entrada of datos.entry ?? []) {
      for (const m of entrada.messaging ?? []) await procesarMensaje(m);
    }
  } catch (e) {
    await evento("procesar_webhook", "error", { mensaje: String(e) });
  }
  return new Response("ok", { status: 200 });
});
