// Cliente mínimo de Gemini con dos proveedores:
//   - Vertex AI (Gemini platform de Google Cloud), pagado con los créditos de Google Cloud. Supabase se
//     identifica con federación de identidad: firma un JWT con su llave privada (Vault de Supabase), Google lo
//     cambia por un token de la cuenta de servicio. Los videos se suben a un bucket temporal de Cloud Storage.
//   - Google AI Studio (API de Gemini), con el secreto GEMINI_API_KEY; los videos van por la Files API.
// index.ts elige el proveedor en cada llamada con fijarProveedor(); si Vertex falla al autenticar,
// la llamada sigue con AI Studio.

import { encodeBase64Url } from "jsr:@std/encoding@1/base64url";

const BASE = "https://generativelanguage.googleapis.com";

export type Parte =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { fileUri: string; mimeType?: string }; videoMetadata?: { startOffset?: string; endOffset?: string; fps?: number } };

// Plazo de la llamada actual a la función (150 s de pared). index.ts lo fija al recibir cada petición;
// los reintentos y cada llamada a Gemini se cortan antes con un error «plazo:», que devuelve la captura a la cola.
let plazoFuncion = Number.POSITIVE_INFINITY;
export function fijarPlazo(msDesdeAhora: number): void {
  plazoFuncion = Date.now() + msDesdeAhora;
}
export const quedaMs = (): number => plazoFuncion - Date.now();

// ── Proveedor ──────────────────────────────────────────────────────────────────────────────────────
type Proveedor = "vertex" | "aistudio";
let proveedor: Proveedor = "aistudio";

// Configuración de Vertex (ajustes de la tabla `ajustes` y llave del Vault, leídos por index.ts).
export interface ConfigVertex {
  preferido: string; // ajuste gemini_proveedor: 'vertex' | 'aistudio'
  proyecto: string; // vertex_proyecto: ID del proyecto de Google Cloud
  bucket: string; // vertex_bucket: bucket privado para videos temporales
  region?: string; // vertex_region (por defecto global)
  alias?: string; // vertex_modelos: "nombre=nombre_en_vertex", separados por comas
  cuenta: string; // vertex_cuenta: correo de la cuenta de servicio
  emisor: string; // wif_emisor: URL del emisor OIDC (función wif-emisor)
  audiencia: string; // wif_audiencia: https://iam.googleapis.com/projects/<n>/locations/global/workloadIdentityPools/<pool>/providers/<prov>
  kid: string; // id de la llave pública publicada
  privada: string | null; // llave privada PKCS8 en base64 (Vault: wif_vertex_llave)
}
let cfgVertex: ConfigVertex | null = null;
let vertexAlias = new Map<string, string>();

export async function fijarProveedor(cfg: ConfigVertex): Promise<Proveedor> {
  cfgVertex = { ...cfg, region: cfg.region || "global" };
  vertexAlias = new Map((cfg.alias ?? "").split(",").map((x) => x.split("=").map((y) => y.trim())).filter((x) => x.length === 2 && x[0] && x[1]) as [string, string][]);
  proveedor = "aistudio";
  if (cfg.preferido === "vertex" && vertexListo()) {
    try {
      await tokenVertex();
      proveedor = "vertex";
    } catch (e) {
      console.warn(`Vertex no autenticó; sigue AI Studio: ${e instanceof Error ? e.message : e}`);
    }
  }
  return proveedor;
}
const vertexListo = () => Boolean(cfgVertex?.privada && cfgVertex.proyecto && cfgVertex.cuenta && cfgVertex.emisor && cfgVertex.audiencia);
export const proveedorActual = (): Proveedor => proveedor;
export const hayCredencial = (): boolean => Boolean(Deno.env.get("GEMINI_API_KEY")) || vertexListo();

// Token de acceso de la cuenta de servicio, guardado hasta 5 minutos antes de vencer:
//   1. JWT RS256 firmado aquí (iss = emisor, sub = procesar-captura, aud = proveedor de identidad).
//   2. STS lo cambia por un token federado.
//   3. IAM Credentials entrega un token de la cuenta de servicio (rol Usuario de Workload Identity).
let tokenCache: { valor: string; vence: number } | null = null;
async function tokenVertex(): Promise<string> {
  if (tokenCache && tokenCache.vence > Date.now() + 300_000) return tokenCache.valor;
  const c = cfgVertex;
  if (!c?.privada) throw new Error("falta la llave de federación (Vault wif_vertex_llave)");
  const ahora = Math.floor(Date.now() / 1000);
  const enc = (o: unknown) => encodeBase64Url(new TextEncoder().encode(JSON.stringify(o)));
  const sinFirma = `${enc({ alg: "RS256", typ: "JWT", kid: c.kid })}.${enc({
    iss: c.emisor, sub: "procesar-captura", aud: c.audiencia, iat: ahora, exp: ahora + 600,
  })}`;
  const der = Uint8Array.from(atob(c.privada), (x) => x.charCodeAt(0));
  const llave = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const firma = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", llave, new TextEncoder().encode(sinFirma)));

  const sts = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grantType: "urn:ietf:params:oauth:grant-type:token-exchange",
      audience: c.audiencia.replace(/^https:/, ""),
      scope: "https://www.googleapis.com/auth/cloud-platform",
      requestedTokenType: "urn:ietf:params:oauth:token-type:access_token",
      subjectTokenType: "urn:ietf:params:oauth:token-type:jwt",
      subjectToken: `${sinFirma}.${encodeBase64Url(firma)}`,
    }),
  });
  const federado = await sts.json().catch(() => ({}));
  if (!sts.ok || !federado.access_token) throw new Error(`sts ${sts.status}: ${JSON.stringify(federado).slice(0, 200)}`);

  const r = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${c.cuenta}:generateAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${federado.access_token}` },
    body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/cloud-platform"], lifetime: "3600s" }),
  });
  const res = await r.json().catch(() => ({}));
  if (!r.ok || !res.accessToken) throw new Error(`iamcredentials ${r.status}: ${JSON.stringify(res?.error?.message ?? res).slice(0, 200)}`);
  tokenCache = { valor: res.accessToken, vence: Date.parse(res.expireTime) || Date.now() + 3_600_000 };
  return tokenCache.valor;
}

async function pedirGenerate(modelo: string, cuerpo: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  if (proveedor === "vertex") {
    const { proyecto, region } = cfgVertex!;
    const m = vertexAlias.get(modelo) ?? modelo;
    const host = region === "global" ? "aiplatform.googleapis.com" : `${region}-aiplatform.googleapis.com`;
    return await fetch(`https://${host}/v1/projects/${proyecto}/locations/${region}/publishers/google/models/${m}:generateContent`, {
      method: "POST", signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await tokenVertex()}` },
      body: JSON.stringify(paraVertex(cuerpo)),
    });
  }
  return await fetch(`${BASE}/v1beta/models/${modelo}:generateContent`, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": clave() },
    body: JSON.stringify(cuerpo),
  });
}

// Vertex exige mimeType en cada fileData (los enlaces de YouTube llegan sin él).
function paraVertex(cuerpo: Record<string, unknown>): Record<string, unknown> {
  const contents = (cuerpo.contents as { role: string; parts: Parte[] }[]).map((c) => ({
    ...c,
    parts: c.parts.map((p) => "fileData" in p && !p.fileData.mimeType ? { ...p, fileData: { ...p.fileData, mimeType: "video/mp4" } } : p),
  }));
  return { ...cuerpo, contents };
}

// Prueba corta de cada modelo con el proveedor vigente (diagnóstico).
export async function probarModelos(modelos: string[]): Promise<Record<string, string>> {
  const salida: Record<string, string> = {};
  for (const m of modelos) {
    const r = await pedirGenerate(m, { contents: [{ role: "user", parts: [{ text: "Responde solo: ok" }] }] }).catch((e) => e as Error);
    if (r instanceof Error) { salida[m] = `error: ${r.message.slice(0, 150)}`; continue; }
    const res = await r.json().catch(() => ({}));
    salida[m] = r.ok ? "ok" : `${r.status}: ${JSON.stringify(res?.error?.message ?? res).slice(0, 150)}`;
  }
  return salida;
}

function clave(): string {
  const k = Deno.env.get("GEMINI_API_KEY");
  if (!k) throw new Error("falta el secreto GEMINI_API_KEY");
  return k;
}

// Pide a Gemini una respuesta JSON que cumpla `esquema` (JSON Schema).
export async function geminiJSON<T>(opciones: {
  modelo: string;
  partes: Parte[];
  esquema: Record<string, unknown>;
  sistema?: string;
  resolucionBaja?: boolean;
  respaldo?: string;
}): Promise<{ datos: T; uso: unknown }> {
  const cuerpo: Record<string, unknown> = {
    contents: [{ role: "user", parts: opciones.partes }],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: opciones.esquema,
      ...(opciones.resolucionBaja ? { mediaResolution: "MEDIA_RESOLUTION_LOW" } : {}),
    },
  };
  if (opciones.sistema) cuerpo.systemInstruction = { parts: [{ text: opciones.sistema }] };

  // Demanda alta (429/500/503): el modelo principal reintenta con espera creciente (3, 6, 12 s) y luego
  // cada modelo de respaldo (lista separada por comas) prueba dos veces. Plazo total: 75 s de espera y llamadas.
  const respaldos = (opciones.respaldo ?? "").split(",").map((m) => m.trim()).filter(Boolean);
  const turnos: { modelo: string; espera: number }[] = [
    { modelo: opciones.modelo, espera: 0 }, { modelo: opciones.modelo, espera: 3000 },
    { modelo: opciones.modelo, espera: 6000 }, { modelo: opciones.modelo, espera: 12000 },
    ...respaldos.flatMap((m) => [{ modelo: m, espera: 2000 }, { modelo: m, espera: 6000 }]),
  ];
  const limite = Math.min(Date.now() + 75_000, plazoFuncion);
  const saturado = (status: number) => status === 429 || status === 500 || status === 503;
  let r!: Response;
  let res: Record<string, any> = {};
  let huboSaturacion = false;
  for (const [i, turno] of turnos.entries()) {
    if (i > 0) {
      if (Date.now() + turno.espera > limite) break;
      await new Promise((ok) => setTimeout(ok, turno.espera));
    }
    const resta = plazoFuncion - Date.now();
    if (resta < 5_000) throw new Error("plazo: tiempo de la función agotado; la captura vuelve a la cola");
    r = await pedirGenerate(turno.modelo, cuerpo, Number.isFinite(resta) ? AbortSignal.timeout(resta) : undefined).catch((e) => {
      if (e instanceof DOMException && e.name === "TimeoutError") throw new Error("plazo: tiempo de la función agotado; la captura vuelve a la cola");
      throw e;
    });
    res = await r.json().catch(() => ({}));
    if (r.ok) break;
    if (saturado(r.status)) huboSaturacion = true;
    // Un respaldo inexistente (404) cede el turno al siguiente; otros errores del principal cortan.
    if (!saturado(r.status) && turno.modelo === opciones.modelo) break;
  }
  // Si hubo saturación en el camino, el error se informa como 503 para que la captura espere sin gastar intento.
  if (!r.ok) throw new Error(`gemini ${huboSaturacion && !saturado(r.status) ? 503 : r.status}: ${JSON.stringify(res?.error ?? res).slice(0, 500)}`);
  const cand = res.candidates?.[0];
  const texto = (cand?.content?.parts ?? []).map((p: { text?: string; thought?: boolean }) => p.thought ? "" : p.text ?? "").join("");
  if (!texto) throw new Error(`gemini sin texto (finishReason=${cand?.finishReason ?? "?"})`);
  return { datos: JSON.parse(texto) as T, uso: res.usageMetadata ?? null };
}

// Sube un archivo (video, audio, imagen): con Vertex, al bucket temporal (gs://…); con AI Studio, a la
// Files API, y espera a que quede ACTIVE.
export async function subirArchivo(bytes: Uint8Array<ArrayBuffer>, mime: string, nombre: string): Promise<{ uri: string; name: string }> {
  if (proveedor === "vertex") {
    const vertexBucket = cfgVertex?.bucket;
    if (!vertexBucket) throw new Error("falta el ajuste vertex_bucket");
    const objeto = `temporal/${nombre}-${Date.now()}`;
    const r = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${vertexBucket}/o?uploadType=media&name=${encodeURIComponent(objeto)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await tokenVertex()}`, "Content-Type": mime },
      body: bytes,
    });
    const res = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`gcs.upload ${r.status}: ${JSON.stringify(res?.error?.message ?? res).slice(0, 200)}`);
    return { uri: `gs://${vertexBucket}/${objeto}`, name: `gcs:${objeto}` };
  }
  const inicio = await fetch(`${BASE}/upload/v1beta/files`, {
    method: "POST",
    headers: {
      "x-goog-api-key": clave(),
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Header-Content-Type": mime,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file: { display_name: nombre } }),
  });
  const urlSubida = inicio.headers.get("x-goog-upload-url");
  await inicio.body?.cancel();
  if (!inicio.ok || !urlSubida) throw new Error(`files.start ${inicio.status}`);

  const subida = await fetch(urlSubida, {
    method: "POST",
    headers: {
      "Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes as Uint8Array<ArrayBuffer>,
  });
  const info = await subida.json().catch(() => ({}));
  if (!subida.ok || !info.file) throw new Error(`files.upload ${subida.status}`);

  let archivo = info.file;
  for (let i = 0; i < 30 && archivo.state === "PROCESSING"; i++) {
    await new Promise((ok) => setTimeout(ok, 2000));
    const r = await fetch(`${BASE}/v1beta/${archivo.name}`, { headers: { "x-goog-api-key": clave() } });
    archivo = await r.json();
  }
  if (archivo.state !== "ACTIVE") throw new Error(`archivo en estado ${archivo.state}`);
  return { uri: archivo.uri, name: archivo.name };
}

export async function borrarArchivo(name: string): Promise<void> {
  if (name.startsWith("gcs:")) {
    const objeto = encodeURIComponent(name.slice(4));
    await fetch(`https://storage.googleapis.com/storage/v1/b/${cfgVertex?.bucket}/o/${objeto}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${await tokenVertex()}` },
    }).then((r) => r.body?.cancel()).catch(() => {});
    return;
  }
  await fetch(`${BASE}/v1beta/${name}`, { method: "DELETE", headers: { "x-goog-api-key": clave() } })
    .then((r) => r.body?.cancel()).catch(() => {});
}
