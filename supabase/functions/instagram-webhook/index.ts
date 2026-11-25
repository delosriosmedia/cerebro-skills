// instagram-webhook: recibe los mensajes que Angel envía por Instagram a su chat de captura
// (un chat que usa solo para guardar ideas) y los registra como capturas del cerebro.
//
// Cómo funciona:
// - GET con hub.* : verificación del webhook que hace Meta al configurarlo.
// - GET ?estado=1 : diagnóstico sin secretos (qué está configurado).
// - GET ?accion=suscribir : suscribe la cuenta conectada al campo "messages".
// - GET ?accion=diagnostico : prueba el token contra Meta y busca la cuenta y el chat destino.
//   Estas tres rutas de administración exigen la cabecera x-cerebro-clave = ajuste cron_clave.
// - POST : eventos de Meta. Se valida la firma X-Hub-Signature-256 con META_APP_SECRET
//   (o con el ajuste "firma_prueba" para pruebas internas).
//   Solo se guardan los mensajes ENVIADOS por la cuenta conectada (is_echo) al chat destino.
//   Todo lo demás (mensajes recibidos, otros chats) se descarta sin guardarse.
//
// Secretos (Supabase > Edge Functions > Secrets): META_APP_SECRET, IG_ACCESS_TOKEN.
// Ajustes no secretos (tabla public.ajustes): instagram_destino_usuario, instagram_destino_igsid,
// instagram_cuenta_id (id de la cuenta conectada; se guarda solo con el primer evento o el diagnóstico).
//
// Tokens: las apps nuevas de Meta usan "Unified login" (token de usuario de sistema, host
// graph.facebook.com). Un token de Instagram Login (empieza con "IG") usa graph.instagram.com.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const VERIFY_TOKEN = Deno.env.get("META_VERIFY_TOKEN") ?? "cerebro-skills";
const APP_SECRET = Deno.env.get("META_APP_SECRET") ?? "";
const IG_TOKEN = Deno.env.get("IG_ACCESS_TOKEN") ?? "";
const GRAPH = IG_TOKEN.startsWith("IG") ? "https://graph.instagram.com" : "https://graph.facebook.com";

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

async function guardarAjuste(clave: string, valor: string) {
  await db.from("ajustes").upsert({ clave, valor });
}

// Llamada GET a la API de Meta. Devuelve estado y cuerpo; el token nunca sale en la respuesta.
async function graph(ruta: string, params: Record<string, string> = {}) {
  const u = new URL(`${GRAPH}/${ruta}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("access_token", IG_TOKEN);
  const r = await fetch(u);
  return { ok: r.ok, status: r.status, cuerpo: await r.json().catch(() => ({})) as Record<string, any> };
}

// Busca en las conversaciones de la cuenta el chat con el usuario destino y guarda su id.
async function resolverDestinoPorConversaciones(): Promise<string | null> {
  const usuario = (await ajuste("instagram_destino_usuario"))?.toLowerCase();
  const cuenta = (await ajuste("instagram_cuenta_id")) || "me";
  if (!usuario || !IG_TOKEN) return null;
  const r = await graph(`${cuenta}/conversations`, { platform: "instagram", fields: "participants", limit: "100" });
  if (!r.ok) {
    await evento("resolver_destino", "aviso", { via: "conversaciones", status: r.status, error: r.cuerpo?.error?.message });
    return null;
  }
  for (const conv of r.cuerpo.data ?? []) {
    for (const p of conv.participants?.data ?? []) {
      if (String(p.username ?? "").toLowerCase() === usuario && p.id) {
        await guardarAjuste("instagram_destino_igsid", String(p.id));
        await evento("resolver_destino", "info", { via: "conversaciones", resuelto: true });
        return String(p.id);
      }
    }
  }
  return null;
}

// ¿El destinatario del mensaje es el chat de captura (ajuste instagram_destino_usuario)?
async function esDestino(idDestinatario: string): Promise<boolean> {
  const fijo = await ajuste("instagram_destino_igsid");
  if (fijo) return fijo === idDestinatario;
  if (descartados.has(idDestinatario) || !IG_TOKEN) return false;
  const usuario = (await ajuste("instagram_destino_usuario"))?.toLowerCase();
  if (!usuario) return false;
  const perfil = await graph(idDestinatario, { fields: "username" });
  if (perfil.ok && String(perfil.cuerpo.username ?? "").toLowerCase() === usuario) {
    await guardarAjuste("instagram_destino_igsid", idDestinatario);
    await evento("resolver_destino", "info", { via: "perfil", resuelto: true });
    return true;
  }
  if (!perfil.ok) {
    await evento("resolver_destino", "aviso", { via: "perfil", status: perfil.status, error: perfil.cuerpo?.error?.message });
    if ((await resolverDestinoPorConversaciones()) === idDestinatario) return true;
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

// Suscribe la cuenta al campo "messages". Unified login suscribe por id de cuenta;
// Instagram Login usa /me.
async function suscribir(cuentaParam: string | null) {
  if (!IG_TOKEN) return { ok: false, motivo: "falta IG_ACCESS_TOKEN" };
  const cuenta = cuentaParam || (await ajuste("instagram_cuenta_id")) || "me";
  if (cuentaParam) await guardarAjuste("instagram_cuenta_id", cuentaParam);
  const u = new URL(`${GRAPH}/${cuenta}/subscribed_apps`);
  u.searchParams.set("subscribed_fields", "messages");
  u.searchParams.set("access_token", IG_TOKEN);
  const r = await fetch(u, { method: "POST" });
  const cuerpo = await r.json().catch(() => ({}));
  await evento("suscribir_webhook", r.ok ? "info" : "error", { cuenta, status: r.status, respuesta: cuerpo });
  return { ok: r.ok, status: r.status, cuenta, respuesta: cuerpo };
}

// Diagnóstico: qué ve el token. Solo devuelve ids, nombres de usuario y errores de Meta.
async function diagnostico() {
  if (!IG_TOKEN) return { ok: false, motivo: "falta IG_ACCESS_TOKEN" };
  const yo = await graph("me", { fields: GRAPH.includes("instagram") ? "user_id,username" : "id,name" });
  const cuentas = GRAPH.includes("instagram")
    ? null
    : await graph("me/accounts", { fields: "id,name,instagram_business_account{id,username}" });
  const cuenta = await ajuste("instagram_cuenta_id");
  const suscripciones = cuenta ? await graph(`${cuenta}/subscribed_apps`) : null;
  const destino = (await ajuste("instagram_destino_igsid")) || (await resolverDestinoPorConversaciones());
  return { host: GRAPH, yo, cuentas, cuenta_id: cuenta, suscripciones, destino_resuelto: Boolean(destino) };
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("hub.mode") === "subscribe") {
      if (url.searchParams.get("hub.verify_token") !== VERIFY_TOKEN) return new Response("token incorrecto", { status: 403 });
      await evento("verificacion_meta", "info", {});
      return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
    }
    const esAdmin = url.searchParams.has("accion") || url.searchParams.has("estado");
    if (esAdmin) {
      const clave = await ajuste("cron_clave");
      if (!clave || req.headers.get("x-cerebro-clave") !== clave) return new Response("no autorizado", { status: 401 });
    }
    if (url.searchParams.get("accion") === "suscribir") return json(await suscribir(url.searchParams.get("cuenta")));
    if (url.searchParams.get("accion") === "diagnostico") return json(await diagnostico());
    if (url.searchParams.get("estado")) {
      return json({
        firma_configurada: Boolean(APP_SECRET),
        token_configurado: Boolean(IG_TOKEN),
        host: GRAPH,
        cuenta_id: await ajuste("instagram_cuenta_id"),
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
      if (entrada.id && !(await ajuste("instagram_cuenta_id")) && (entrada.messaging ?? []).length) {
        await guardarAjuste("instagram_cuenta_id", String(entrada.id));
      }
      for (const m of entrada.messaging ?? []) await procesarMensaje(m);
    }
  } catch (e) {
    await evento("procesar_webhook", "error", { mensaje: String(e) });
  }
  return new Response("ok", { status: 200 });
});
