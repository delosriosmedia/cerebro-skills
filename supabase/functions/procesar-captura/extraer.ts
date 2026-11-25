// Extracción: convierte una captura en texto legible (post, transcripción, texto en pantalla, enlaces).
// Rutas por plataforma:
//   youtube              → Gemini recibe el enlace y ve el video completo.
//   instagram (DM)       → video del CDN de Meta (payload del webhook) → bucket `medios` → Gemini.
//   instagram/threads/facebook (solo enlace) → Apify trae texto y URL del video → Gemini.
//   github               → API pública de GitHub (descripción + README).
//   web                  → HTML de la página reducido a texto.
//   nota                 → la nota de Angel es el contenido.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";
import { encodeBase64 } from "jsr:@std/encoding@1.0.10/base64";
import { borrarArchivo, geminiJSON, type Parte, subirArchivo } from "./gemini.ts";

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
    descripcion_visual: { type: "string", description: "Qué se ve: interfaz, herramienta, demostración, pasos mostrados, estilo visual (colores, tipografía, composición)" },
    animaciones: {
      type: "array",
      description: "Cada animación, transición o microinteracción visible: qué elemento se mueve, qué lo dispara (clic, hover, scroll, carga), cómo se mueve (desliza, escala, se desvanece, rebota, se reordena, morph), duración aproximada, curva o ritmo y efectos asociados (desenfoque, sombra, brillo, cambio de color). Lista vacía si el video carece de movimiento de interfaz o gráfico",
      items: {
        type: "object",
        properties: {
          segundo: { type: "integer" },
          elemento: { type: "string" },
          disparador: { type: "string" },
          movimiento: { type: "string" },
          duracion_ms: { type: "integer" },
          ritmo: { type: "string", description: "Curva o sensación: ease-out, resorte, lineal, escalonado" },
          efectos: { type: "string" },
        },
        required: ["segundo", "elemento", "movimiento"],
      },
    },
    prompts_visibles: { type: "array", items: { type: "string" }, description: "Prompts completos que aparecen o se dictan, copiados literalmente" },
    pasos: { type: "array", items: { type: "string" }, description: "Procedimiento paso a paso si el video enseña uno" },
    herramientas: { type: "array", items: { type: "string" }, description: "Apps, modelos, repos, MCP, plugins o servicios mencionados" },
    enlaces: { type: "array", items: { type: "string" }, description: "URLs dichas o mostradas" },
    repos: { type: "array", items: { type: "string" }, description: "Repositorios en formato owner/nombre o URL de GitHub" },
    momentos: {
      type: "array",
      description: "De 3 a 6 instantes donde se ve cada pieza clave (prompt en pantalla, paso, herramienta, dato), en segundos desde el inicio del video completo",
      items: {
        type: "object",
        properties: { segundo: { type: "integer" }, que_se_ve: { type: "string" } },
        required: ["segundo", "que_se_ve"],
      },
    },
  },
  required: ["titulo", "transcripcion", "texto_pantalla", "descripcion_visual", "prompts_visibles", "pasos", "herramientas", "enlaces", "repos", "momentos", "animaciones"],
};

const SISTEMA_VIDEO =
  "Eres el extractor del cerebro de skills de Angel. Recibes un video corto o largo sobre inteligencia artificial, " +
  "diseño, video o automatización. Devuelve el contenido completo y literal: transcripción íntegra, todo el texto en pantalla, " +
  "prompts copiados palabra por palabra y cada herramienta o repositorio mencionado. Conserva el idioma original del video. " +
  "En videos de diseño, interfaz o motion, describe con precisión cada animación, transición y microinteracción: " +
  "qué se mueve, qué la dispara, cómo se mueve, cuánto dura y qué efectos la acompañan, como para poder recrearla.";

type DatosVideo = {
  titulo?: string; autor?: string; idioma?: string; duracion_s?: number;
  transcripcion?: string; texto_pantalla?: string; descripcion_visual?: string;
  prompts_visibles?: string[]; pasos?: string[]; herramientas?: string[]; enlaces?: string[]; repos?: string[];
  momentos?: { segundo: number; que_se_ve: string }[];
  animaciones?: Record<string, unknown>[];
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
      pasos: d.pasos, herramientas: d.herramientas, momentos: d.momentos ?? [], animaciones: d.animaciones ?? [],
    },
    ...extra,
  };
}

// Videos largos: Gemini analiza tramos en paralelo (videoMetadata con inicio y fin) para que la
// llamada completa quepa en los 150 s de la función. Tramo por defecto: 3 minutos (ajuste youtube_tramo_s).
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const unir = (listas: (string[] | undefined)[]) => [...new Set(listas.flatMap((l) => l ?? []))];

// Tiempo máximo de lectura de tramos por llamada (la función tiene 150 s). Cada tramo terminado se
// guarda en `eventos` (etapa 'tramo'); la llamada siguiente lee solo los que faltan.
const PLAZO_TRAMOS_MS = 100_000;

async function videoYoutube(
  db: SupabaseClient, capturaId: string, url: string, duracion: number | null, ajuste: Ajustes,
): Promise<Contenido> {
  const modelo = await ajuste("gemini_modelo_video", "gemini-flash-latest");
  const respaldo = await ajuste("gemini_modelo_respaldo", "gemini-flash-lite-latest");
  const tramo = Number(await ajuste("youtube_tramo_s", "180")) || 180;
  const cortes: [number, number][] = [];
  if (duracion && duracion > tramo * 1.2) {
    for (let ini = 0; ini < duracion; ini += tramo) cortes.push([ini, Math.min(duracion, ini + tramo)]);
  }

  const pedir = (corte?: [number, number]) => geminiJSON<DatosVideo>({
    modelo,
    sistema: SISTEMA_VIDEO,
    esquema: ESQUEMA_VIDEO,
    respaldo,
    resolucionBaja: true, // menos tokens por cuadro; el texto en pantalla sigue legible en la mayoría de videos
    partes: [
      corte
        ? { fileData: { fileUri: url }, videoMetadata: { startOffset: `${corte[0]}s`, endOffset: `${corte[1]}s` } }
        : { fileData: { fileUri: url } },
      { text: corte
        ? `Extrae el contenido de este tramo del video (${mmss(corte[0])} a ${mmss(corte[1])}). En "momentos" usa segundos contados desde el inicio del video completo (entre ${corte[0]} y ${corte[1]}).`
        : "Extrae el contenido de este video." },
    ],
  });

  if (!cortes.length) {
    const { datos, uso } = await pedir();
    return contenidoDesdeVideo(datos, {}, uso, modelo);
  }

  type Tramo = { datos: DatosVideo; uso: unknown };
  const hechos = new Map<number, Tramo>();
  const { data: guardados } = await db.from("eventos").select("detalle")
    .eq("captura_id", capturaId).eq("etapa", "tramo").order("creado_en");
  for (const g of guardados ?? []) {
    const t = g.detalle as { inicio: number; fin: number; datos: DatosVideo; uso: unknown };
    if (cortes.some((c) => c[0] === t.inicio && c[1] === t.fin)) hechos.set(t.inicio, { datos: t.datos, uso: t.uso });
  }

  const limite = Date.now() + PLAZO_TRAMOS_MS;
  const errores: string[] = [];
  let nuevos = 0;
  await Promise.all(cortes.filter((c) => !hechos.has(c[0])).map(async (c) => {
    let reloj: ReturnType<typeof setTimeout> | undefined;
    const plazo = new Promise<null>((ok) => { reloj = setTimeout(() => ok(null), Math.max(0, limite - Date.now())); });
    try {
      const r = await Promise.race([pedir(c), plazo]);
      if (!r) return;
      hechos.set(c[0], r);
      nuevos++;
      await db.from("eventos").insert({
        captura_id: capturaId, etapa: "tramo", nivel: "info", detalle: { inicio: c[0], fin: c[1], datos: r.datos, uso: r.uso },
      });
    } catch (e) {
      errores.push(String(e instanceof Error ? e.message : e));
    } finally {
      clearTimeout(reloj);
    }
  }));

  const faltan = cortes.filter((c) => !hechos.has(c[0])).length;
  if (faltan) {
    const estado = `${cortes.length - faltan} de ${cortes.length} tramos listos`;
    // Con avance en esta llamada, la captura sigue sin gastar intento ("parcial:").
    if (nuevos) throw new Error(`parcial: ${estado}; el resto en la próxima llamada`);
    throw new Error(errores[0] ?? `tramos sin respuesta a tiempo (${estado})`);
  }
  const partes = cortes.map((c) => hechos.get(c[0])!);
  const d = partes.map((p) => p.datos);
  const conTramo = (campo: "transcripcion" | "texto_pantalla" | "descripcion_visual") =>
    d.map((x, i) => x[campo] ? `[${mmss(cortes[i][0])}–${mmss(cortes[i][1])}]\n${x[campo]}` : "").filter(Boolean).join("\n\n");
  const unido: DatosVideo = {
    titulo: d.find((x) => x.titulo)?.titulo,
    autor: d.find((x) => x.autor)?.autor,
    idioma: d.find((x) => x.idioma)?.idioma,
    duracion_s: duracion ?? undefined,
    transcripcion: conTramo("transcripcion"),
    texto_pantalla: conTramo("texto_pantalla"),
    descripcion_visual: conTramo("descripcion_visual"),
    prompts_visibles: unir(d.map((x) => x.prompts_visibles)),
    pasos: d.flatMap((x) => x.pasos ?? []),
    herramientas: unir(d.map((x) => x.herramientas)),
    enlaces: unir(d.map((x) => x.enlaces)),
    repos: unir(d.map((x) => x.repos)),
    animaciones: d.flatMap((x) => x.animaciones ?? []),
    // Si el modelo contó desde el inicio del tramo, se corrige sumando el inicio.
    momentos: d.flatMap((x, i) => (x.momentos ?? []).map((m) => ({
      ...m, segundo: m.segundo < cortes[i][0] ? m.segundo + cortes[i][0] : m.segundo,
    }))),
  };
  return contenidoDesdeVideo(unido, {}, { tramos: cortes.length, por_tramo: partes.map((p) => p.uso) }, modelo);
}

// Descarga un video, lo guarda en `medios` y lo analiza con Gemini.
async function videoDesdeArchivo(
  db: SupabaseClient, captura: Captura, urlVideo: string, textoPost: string | null, ajuste: Ajustes,
): Promise<Contenido> {
  const r = await fetch(urlVideo);
  if (!r.ok) throw new Error(`descarga de video ${r.status}`);
  const mime = (r.headers.get("content-type") ?? "video/mp4").split(";")[0];
  const bytes = new Uint8Array(await r.arrayBuffer());
  if (mime.startsWith("image/")) {
    // El DM trajo una imagen: se guarda como capturas/<id>-1.<ext> y se lee con Gemini.
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const rutaImg = `capturas/${captura.id}-1.${ext}`;
    const { error } = await db.storage.from("medios").upload(rutaImg, bytes, { contentType: mime, upsert: true });
    if (error) throw new Error(`storage: ${error.message}`);
    return await imagenesConGemini(db, captura, [rutaImg], textoPost, ajuste);
  }
  if (bytes.byteLength > MAX_VIDEO) throw new Error(`video de ${Math.round(bytes.byteLength / 1e6)} MB supera el tope de 50 MB`);

  const ext = mime.includes("mp4") ? "mp4" : mime.split("/")[1] ?? "bin";
  const ruta = `capturas/${captura.id}.${ext}`;
  const { error } = await db.storage.from("medios").upload(ruta, bytes, { contentType: mime, upsert: true });
  if (error) throw new Error(`storage: ${error.message}`);

  return await leerVideo(captura, bytes, mime, ruta, textoPost, ajuste);
}

// Lee con Gemini un video ya descargado. Usa varios cuadros por segundo (ajuste gemini_fps_archivo,
// 4 por defecto) para que las animaciones cortas queden visibles.
async function leerVideo(
  captura: Captura, bytes: Uint8Array<ArrayBuffer>, mime: string, ruta: string, textoPost: string | null, ajuste: Ajustes,
): Promise<Contenido> {
  const modelo = await ajuste("gemini_modelo_video", "gemini-flash-latest");
  const respaldo = await ajuste("gemini_modelo_respaldo", "gemini-flash-lite-latest");
  const fps = Number(await ajuste("gemini_fps_archivo", "4")) || 4;
  const archivo = await subirArchivo(bytes, mime, `captura-${captura.id}`);
  try {
    const { datos, uso } = await geminiJSON<DatosVideo>({
      modelo,
      sistema: SISTEMA_VIDEO,
      esquema: ESQUEMA_VIDEO,
      respaldo,
      partes: [
        { fileData: { fileUri: archivo.uri, mimeType: mime }, videoMetadata: { fps } },
        { text: `Extrae el contenido de este video.${textoPost ? `\n\nTexto que acompaña la publicación:\n${textoPost}` : ""}` },
      ],
    });
    return contenidoDesdeVideo(datos, { medio_ruta: ruta }, uso, modelo);
  } finally {
    await borrarArchivo(archivo.name);
  }
}

// Vuelve a leer el video ya guardado en `medios` (por ejemplo tras mejorar el extractor).
export async function releerVideoGuardado(
  db: SupabaseClient, captura: Captura, ruta: string, textoPost: string | null, ajuste: Ajustes,
): Promise<Contenido> {
  const { data, error } = await db.storage.from("medios").download(ruta);
  if (error || !data) throw new Error(`storage: ${error?.message ?? "sin archivo"}`);
  const mime = data.type || "video/mp4";
  return await leerVideo(captura, new Uint8Array(await data.arrayBuffer()), mime, ruta, textoPost, ajuste);
}

// Guarda imágenes de la publicación (carrusel, portada) en `medios` como capturas/<id>-<n>.<ext>.
// La revisión las muestra en la ficha junto a la pregunta. Devuelve las rutas guardadas.
async function guardarImagenes(db: SupabaseClient, captura: Captura, urls: string[]): Promise<string[]> {
  const rutas: string[] = [];
  for (const [i, u] of urls.slice(0, 10).entries()) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const mime = (r.headers.get("content-type") ?? "image/jpeg").split(";")[0];
      if (!mime.startsWith("image/")) { await r.body?.cancel(); continue; }
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const ruta = `capturas/${captura.id}-${i + 1}.${ext}`;
      const { error } = await db.storage.from("medios").upload(ruta, new Uint8Array(await r.arrayBuffer()), { contentType: mime, upsert: true });
      if (!error) rutas.push(ruta);
    } catch { /* una imagen caída se omite */ }
  }
  return rutas;
}

// Lee con Gemini las imágenes ya guardadas en `medios` (texto en pantalla, prompts, herramientas).
async function imagenesConGemini(
  db: SupabaseClient, captura: Captura, rutas: string[], textoPost: string | null, ajuste: Ajustes,
): Promise<Contenido> {
  const partes: Parte[] = [];
  for (const ruta of rutas) {
    const { data } = await db.storage.from("medios").download(ruta);
    if (!data) continue;
    partes.push({ inlineData: { mimeType: data.type || "image/jpeg", data: encodeBase64(new Uint8Array(await data.arrayBuffer())) } });
  }
  if (!partes.length) throw new Error("sin imágenes legibles");
  const modelo = await ajuste("gemini_modelo_video", "gemini-flash-latest");
  const respaldo = await ajuste("gemini_modelo_respaldo", "gemini-flash-lite-latest");
  const { datos, uso } = await geminiJSON<DatosVideo>({
    modelo,
    sistema: SISTEMA_VIDEO.replace("Recibes un video corto o largo", "Recibes las imágenes de una publicación (carrusel o captura)"),
    esquema: ESQUEMA_VIDEO,
    respaldo,
    partes: [...partes, { text: `Extrae el contenido de estas imágenes, en orden. Deja transcripcion vacía y usa "momentos" con segundo = número de imagen.${textoPost ? `\n\nTexto de la publicación:\n${textoPost}` : ""}` }],
  });
  return contenidoDesdeVideo(datos, { medio_ruta: rutas[0] }, uso, modelo);
}

// Todas las URL de imagen de un ítem de Apify (portada y carrusel), sin repetir.
function imagenesDe(item: ItemApify): string[] {
  const s = new Set<string>();
  const agregar = (v: unknown) => {
    if (typeof v === "string" && v.startsWith("http")) s.add(v);
    else if (v && typeof v === "object" && typeof (v as Record<string, unknown>).url === "string") s.add((v as Record<string, string>).url);
  };
  for (const k of ["displayUrl", "imageUrl", "image", "thumbnailUrl", "thumbnail"]) agregar(item[k]);
  for (const k of ["images", "imageUrls", "media"]) if (Array.isArray(item[k])) (item[k] as unknown[]).forEach(agregar);
  if (Array.isArray(item.childPosts)) for (const h of item.childPosts as ItemApify[]) agregar(h.displayUrl);
  return [...s];
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

  if (p === "youtube") {
    const duracion = previos.find((c) => c.duracion_s)?.duracion_s ?? null; // la deja youtube-lista
    return { contenidos: [await videoYoutube(db, captura.id, url, duracion, ajuste)], ruta: "gemini_youtube" };
  }
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
        console.warn("medio del DM falló, sigo con Apify:", String(e));
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
    const imagenes = await guardarImagenes(db, captura, imagenesDe(item));
    if (imagenes.length) deApify.bruto = { ...deApify.bruto, imagenes };
    const contenidos: Contenido[] = [deApify];
    if (video) contenidos.push(await videoDesdeArchivo(db, captura, video, texto, ajuste));
    else if (imagenes.length) contenidos.push(await imagenesConGemini(db, captura, imagenes, texto, ajuste));
    return { contenidos, ruta: video ? "apify+gemini" : "apify" };
  }

  throw new Error(`plataforma sin ruta de extracción: ${p}`);
}
