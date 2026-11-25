// Extracción: convierte una captura en texto legible (post, transcripción, texto en pantalla, enlaces).
// Rutas por plataforma:
//   youtube              → Gemini recibe el enlace y ve el video completo.
//   instagram (DM)       → video del CDN de Meta (payload del webhook) → bucket `medios` → Gemini.
//   instagram/threads/facebook (solo enlace) → Apify trae texto y URL del video → Gemini.
//   github               → API pública de GitHub (descripción + README).
//   web                  → HTML de la página reducido a texto.
//   nota                 → la nota de Angel es el contenido.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { borrarArchivo, geminiJSON, subirArchivo } from "./gemini.ts";

export type Captura = {
  id: string;
  canal: string;
  plataforma: string;
  url: string | null;
  url_normalizada: string | null;
  nota_angel: string | null;
  estado: string;
  intentos: number;
};

export type Contenido = {
  fuente_extraccion: string;
  autor?: string | null;
  titulo?: string | null;
  texto_post?: string | null;
  transcripcion?: string | null;
  texto_pantalla?: string | null;
  enlaces?: string[];
  repos?: string[];
  duracion_s?: number | null;
  idioma?: string | null;
  medio_ruta?: string | null;
  bruto?: Record<string, unknown> | null;
};

type Ajustes = (clave: string, defecto: string) => Promise<string>;

const MAX_VIDEO = 50 * 1024 * 1024; // tope del bucket `medios`

// ---------- Video con Gemini ----------

const ESQUEMA_VIDEO = {
  type: "object",
  properties: {
    titulo: { type: "string", description: "Título o tema central del video en pocas palabras" },
    autor: { type: "string", description: "Cuenta o persona que habla, si se identifica" },
    idioma: { type: "string", description: "Código ISO del idioma hablado, por ejemplo es, en" },
    duracion_s: { type: "integer" },
    transcripcion: { type: "string", description: "Transcripción fiel de todo lo que se dice, en el idioma original" },
    texto_pantalla: { type: "string", description: "Todo el texto visible en pantalla: títulos, subtítulos quemados, código, comandos, URLs, nombres de herramientas" },
    descripcion_visual: { type: "string", description: "Qué se ve: interfaz, herramienta, demostración, pasos mostrados" },
    prompts_visibles: { type: "array", items: { type: "string" }, description: "Prompts completos que aparecen o se dictan, copiados literalmente" },
    pasos: { type: "array", items: { type: "string" }, description: "Procedimiento paso a paso si el video enseña uno" },
    herramientas: { type: "array", items: { type: "string" }, description: "Apps, modelos, repos, MCP, plugins o servicios mencionados" },
    enlaces: { type: "array", items: { type: "string" }, description: "URLs dichas o mostradas" },
    repos: { type: "array", items: { type: "string" }, description: "Repositorios en formato owner/nombre o URL de GitHub" },
  },
  required: ["titulo", "transcripcion", "texto_pantalla", "descripcion_visual", "prompts_visibles", "pasos", "herramientas", "enlaces", "repos"],
};

const SISTEMA_VIDEO =
  "Eres el extractor del cerebro de skills de Angel. Recibes un video corto o largo sobre inteligencia artificial, " +
  "diseño, video o automatización. Devuelve el contenido completo y literal: transcripción íntegra, todo el texto en pantalla, " +
  "prompts copiados palabra por palabra y cada herramienta o repositorio mencionado. Conserva el idioma original del video.";

type DatosVideo = {
  titulo?: string; autor?: string; idioma?: string; duracion_s?: number;
  transcripcion?: string; texto_pantalla?: string; descripcion_visual?: string;
  prompts_visibles?: string[]; pasos?: string[]; herramientas?: string[]; enlaces?: string[]; repos?: string[];
};

function contenidoDesdeVideo(d: DatosVideo, extra: Partial<Contenido>, uso: unknown, modelo: string): Contenido {
  return {
    fuente_extraccion: "gemini",
    titulo: d.titulo ?? null,
    autor: d.autor ?? null,
    idioma: d.idioma ?? null,
    duracion_s: d.duracion_s ?? null,
    transcripcion: d.transcripcion ?? null,
    texto_pantalla: d.texto_pantalla ?? null,
    enlaces: d.enlaces ?? [],
    repos: d.repos ?? [],
    bruto: {
      modelo, uso,
      descripcion_visual: d.descripcion_visual, prompts_visibles: d.prompts_visibles,
      pasos: d.pasos, herramientas: d.herramientas,
    },
    ...extra,
  };
}

async function videoYoutube(url: string, ajuste: Ajustes): Promise<Contenido> {
  const modelo = await ajuste("gemini_modelo_video", "gemini-flash-latest");
  const { datos, uso } = await geminiJSON<DatosVideo>({
    modelo,
    sistema: SISTEMA_VIDEO,
    esquema: ESQUEMA_VIDEO,
    resolucionBaja: true, // menos tokens por cuadro; el texto en pantalla sigue legible en la mayoría de videos
    partes: [{ fileData: { fileUri: url } }, { text: "Extrae el contenido de este video." }],
  });
  return contenidoDesdeVideo(datos, {}, uso, modelo);
}

// Descarga un video, lo guarda en `medios` y lo analiza con Gemini.
async function videoDesdeArchivo(
  db: SupabaseClient, captura: Captura, urlVideo: string, textoPost: string | null, ajuste: Ajustes,
): Promise<Contenido> {
  const r = await fetch(urlVideo);
  if (!r.ok) throw new Error(`descarga de video ${r.status}`);
  const mime = (r.headers.get("content-type") ?? "video/mp4").split(";")[0];
  const bytes = new Uint8Array(await r.arrayBuffer());
  if (bytes.byteLength > MAX_VIDEO) throw new Error(`video de ${Math.round(bytes.byteLength / 1e6)} MB supera el tope de 50 MB`);

  const ext = mime.includes("mp4") ? "mp4" : mime.split("/")[1] ?? "bin";
  const ruta = `capturas/${captura.id}.${ext}`;
  const { error } = await db.storage.from("medios").upload(ruta, bytes, { contentType: mime, upsert: true });
  if (error) throw new Error(`storage: ${error.message}`);

  const modelo = await ajuste("gemini_modelo_video", "gemini-flash-latest");
  const archivo = await subirArchivo(bytes, mime, `captura-${captura.id}`);
  try {
    const { datos, uso } = await geminiJSON<DatosVideo>({
      modelo,
      sistema: SISTEMA_VIDEO,
      esquema: ESQUEMA_VIDEO,
      partes: [
        { fileData: { fileUri: archivo.uri, mimeType: mime } },
        { text: `Extrae el contenido de este video.${textoPost ? `\n\nTexto que acompaña la publicación:\n${textoPost}` : ""}` },
      ],
    });
    return contenidoDesdeVideo(datos, { medio_ruta: ruta }, uso, modelo);
  } finally {
    await borrarArchivo(archivo.name);
  }
}

// ---------- Apify (posts que llegan solo como enlace) ----------

type ItemApify = Record<string, unknown>;

const ACTORES: Record<string, { actor: string; entrada: string }> = {
  instagram: { actor: "apify~instagram-scraper", entrada: '{"directUrls":["{url}"],"resultsType":"posts","resultsLimit":1}' },
  facebook: { actor: "apify~facebook-posts-scraper", entrada: '{"startUrls":[{"url":"{url}"}],"resultsLimit":1}' },
  threads: { actor: "automation-lab~threads-scraper", entrada: '{"startUrls":[{"url":"{url}"}],"maxItems":1}' },
};

async function apify(plataforma: string, url: string, ajuste: Ajustes): Promise<ItemApify> {
  const token = Deno.env.get("APIFY_TOKEN");
  if (!token) throw new Error("falta el secreto APIFY_TOKEN");
  const def = ACTORES[plataforma];
  const actor = await ajuste(`apify_actor_${plataforma}`, def.actor);
  const plantilla = await ajuste(`apify_entrada_${plataforma}`, def.entrada);
  const entrada = plantilla.replaceAll("{url}", url.replaceAll('"', "%22"));
  const r = await fetch(
    `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?timeout=90&clean=true`,
    { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: entrada },
  );
  const items = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`apify ${r.status}: ${JSON.stringify(items).slice(0, 300)}`);
  if (!Array.isArray(items) || !items.length) throw new Error("apify no devolvió resultados");
  return items[0];
}

// Busca el primer valor de texto entre varias rutas posibles (cada actor nombra distinto sus campos).
function primero(item: ItemApify, rutas: string[]): string | null {
  for (const ruta of rutas) {
    let v: unknown = item;
    for (const k of ruta.split(".")) v = (v as Record<string, unknown> | undefined)?.[k];
    if (Array.isArray(v)) v = v[0];
    if (v && typeof v === "object" && "url" in (v as Record<string, unknown>)) v = (v as Record<string, unknown>).url;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

const enlacesDe = (texto: string | null): string[] => (texto ?? "").match(/https?:\/\/[^\s<>"')]+/g) ?? [];
const reposDe = (textos: (string | null | undefined)[]): string[] => {
  const s = new Set<string>();
  for (const t of textos) for (const m of (t ?? "").matchAll(/github\.com\/([\w.-]+\/[\w.-]+)/g)) s.add(m[1].replace(/\.git$/, ""));
  return [...s];
};

// ---------- GitHub y web ----------

async function github(url: string): Promise<Contenido> {
  const m = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!m) throw new Error("enlace de GitHub sin owner/repo");
  const repo = `${m[1]}/${m[2].replace(/\.git$/, "")}`;
  const h = { Accept: "application/vnd.github+json", "User-Agent": "cerebro-skills" };
  const [info, readme] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}`, { headers: h }).then((r) => r.ok ? r.json() : null),
    fetch(`https://api.github.com/repos/${repo}/readme`, { headers: { ...h, Accept: "application/vnd.github.raw" } }).then((r) => r.ok ? r.text() : null),
  ]);
  if (!info) throw new Error(`repositorio ${repo} inaccesible`);
  return {
    fuente_extraccion: "github_api",
    autor: info.owner?.login ?? null,
    titulo: info.full_name,
    texto_post: [info.description, readme?.slice(0, 60000)].filter(Boolean).join("\n\n"),
    enlaces: [url, info.homepage].filter(Boolean),
    repos: [repo],
    bruto: { estrellas: info.stargazers_count, licencia: info.license?.spdx_id, lenguaje: info.language, actualizado: info.pushed_at, temas: info.topics },
  };
}

async function web(url: string): Promise<Contenido> {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (cerebro-skills)" }, redirect: "follow" });
  if (!r.ok) throw new Error(`web ${r.status}`);
  const html = (await r.text()).slice(0, 2_000_000);
  const meta = (p: string) => html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${p}["'][^>]+content=["']([^"']*)`, "i"))?.[1] ?? null;
  const titulo = meta("og:title") ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? null;
  const texto = html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, " ").trim().slice(0, 60000);
  return {
    fuente_extraccion: "otra",
    titulo,
    texto_post: [meta("og:description"), texto].filter(Boolean).join("\n\n"),
    enlaces: [url],
    repos: reposDe([texto]),
    bruto: { origen: "web" },
  };
}

// ---------- Orquestación ----------

// Devuelve los contenidos nuevos para la captura. `previos` son los ya guardados (por ejemplo el del DM de Instagram).
export async function extraer(
  db: SupabaseClient, captura: Captura, previos: Contenido[], ajuste: Ajustes,
): Promise<{ contenidos: Contenido[]; ruta: string }> {
  const url = captura.url;
  const p = captura.plataforma;

  if (p === "nota") {
    return { contenidos: [{ fuente_extraccion: "manual", texto_post: captura.nota_angel, enlaces: enlacesDe(captura.nota_angel), bruto: { origen: "nota" } }], ruta: "nota" };
  }
  if (!url) throw new Error("captura sin URL");

  if (p === "youtube") return { contenidos: [await videoYoutube(url, ajuste)], ruta: "gemini_youtube" };
  if (p === "github") return { contenidos: [await github(url)], ruta: "github_api" };
  if (p === "web") return { contenidos: [await web(url)], ruta: "web" };

  if (p === "instagram" || p === "threads" || p === "facebook") {
    // 1) Video recibido por DM: la URL del CDN de Meta llega en el payload del webhook.
    const dm = previos.find((c) => c.fuente_extraccion === "dm_instagram");
    const payload = (dm?.bruto?.payload ?? {}) as Record<string, unknown>;
    const urlDm = typeof payload.url === "string" ? payload.url : null;
    if (urlDm) {
      try {
        return { contenidos: [await videoDesdeArchivo(db, captura, urlDm, dm?.texto_post ?? null, ajuste)], ruta: "dm_cdn+gemini" };
      } catch (e) {
        console.warn("video del DM falló, sigo con Apify:", String(e));
      }
    }

    // 2) Apify trae texto, autor y URL del video.
    const urlPublica = url.startsWith("http") ? url : null;
    if (!urlPublica) throw new Error("sin URL pública para Apify");
    const item = await apify(p, urlPublica, ajuste);
    const texto = primero(item, ["caption", "text", "postText", "content", "message", "description", "title"]);
    const autor = primero(item, ["ownerUsername", "username", "author.username", "user.username", "user.name", "pageName", "authorName"]);
    const video = primero(item, ["videoUrl", "video_url", "videoUrls", "video.url", "media.video_url", "playable_url", "videos"]);
    const deApify: Contenido = {
      fuente_extraccion: "apify",
      autor,
      texto_post: texto,
      enlaces: enlacesDe(texto),
      repos: reposDe([texto]),
      bruto: { item },
    };
    const contenidos: Contenido[] = [deApify];
    if (video) contenidos.push(await videoDesdeArchivo(db, captura, video, texto, ajuste));
    return { contenidos, ruta: video ? "apify+gemini" : "apify" };
  }

  throw new Error(`plataforma sin ruta de extracción: ${p}`);
}
