// Cliente mínimo de la API de Gemini (generateContent + Files API).
// La clave vive en el secreto GEMINI_API_KEY de Supabase.

const BASE = "https://generativelanguage.googleapis.com";

export type Parte =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { fileUri: string; mimeType?: string }; videoMetadata?: { startOffset?: string; endOffset?: string; fps?: number } };

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

  // Demanda alta (429/503): dos reintentos con espera y luego el modelo de respaldo.
  const modelos = [opciones.modelo, opciones.modelo, opciones.modelo, ...(opciones.respaldo ? [opciones.respaldo] : [])];
  let r!: Response;
  let res: Record<string, any> = {};
  for (const [i, modelo] of modelos.entries()) {
    if (i > 0 && i < 3) await new Promise((ok) => setTimeout(ok, i * 4000));
    r = await fetch(`${BASE}/v1beta/models/${modelo}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": clave() },
      body: JSON.stringify(cuerpo),
    });
    res = await r.json().catch(() => ({}));
    if (r.ok || (r.status !== 429 && r.status !== 503)) break;
  }
  if (!r.ok) throw new Error(`gemini ${r.status}: ${JSON.stringify(res?.error ?? res).slice(0, 500)}`);
  const cand = res.candidates?.[0];
  const texto = (cand?.content?.parts ?? []).map((p: { text?: string; thought?: boolean }) => p.thought ? "" : p.text ?? "").join("");
  if (!texto) throw new Error(`gemini sin texto (finishReason=${cand?.finishReason ?? "?"})`);
  return { datos: JSON.parse(texto) as T, uso: res.usageMetadata ?? null };
}

// Sube un archivo (video, audio, imagen) a la Files API y espera a que quede ACTIVE.
export async function subirArchivo(bytes: Uint8Array<ArrayBuffer>, mime: string, nombre: string): Promise<{ uri: string; name: string }> {
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
  await fetch(`${BASE}/v1beta/${name}`, { method: "DELETE", headers: { "x-goog-api-key": clave() } })
    .then((r) => r.body?.cancel()).catch(() => {});
}
