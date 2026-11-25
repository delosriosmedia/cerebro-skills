// procesar-captura: etapa de procesamiento del cerebro, común a todas las fuentes.
//
// Qué hace con cada captura en estado 'recibida' (llegada hace más de 3 minutos):
//   1. La marca 'extrayendo' (función SQL tomar_capturas, con reintentos hasta 3 veces).
//   2. Extrae su contenido (extraer.ts): Gemini para video, Apify para posts que llegan solo como enlace,
//      API de GitHub para repos, HTML para páginas web. Guarda filas nuevas en `contenidos`.
//   3. Interpreta el guardado (interpretar.ts; si la extracción fue larga, en la llamada siguiente
//      con la captura en estado 'interpretando') y guarda una fila en `interpretaciones` con destino,
//      piezas aprovechables y preguntas sugeridas para Angel (en `detalle`).
//   4. Deja la captura en 'extraida', que es la señal para el hilo de revisión (vista cola_revision).
//
// Llamadas:
//   POST {}                    → procesa un lote (lo hace pg_cron cada 5 minutos).
//   POST {"captura_id": "…"}   → procesa esa captura aunque esté en otro estado (pruebas).
//   POST {"captura_id": "…", "solo": "interpretar"} → repite solo la interpretación.
//   POST {"captura_id": "…", "solo": "video"} → relee el video guardado en `medios`, actualiza su fila
//        de `contenidos` y repite la interpretación, sin cambiar el estado de la captura.
//   GET  ?estado=1             → diagnóstico sin secretos (con &probar=1 prueba cada modelo configurado).
// Autenticación: cabecera x-cerebro-clave = ajustes.cron_clave.
// Proveedor de Gemini: ajuste gemini_proveedor ('vertex' por defecto; si Vertex no autentica, sigue AI Studio).
//   Vertex AI se paga con los créditos de Google Cloud y entra por federación de identidad: llave privada en el
//   Vault de Supabase (wif_vertex_llave), emisor OIDC en la función wif-emisor, ajustes vertex_* y wif_*.
// Secretos: GEMINI_API_KEY (AI Studio, respaldo); APIFY_TOKEN (posts por enlace); ANTHROPIC_API_KEY (si interprete = claude).

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { type Captura, type Contenido, extraer, releerVideoGuardado } from "./extraer.ts";
import { armarEntrada, interpretar } from "./interpretar.ts";
import { fijarPlazo, fijarProveedor, hayCredencial, probarModelos } from "./gemini.ts";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json" } });

const cacheAjustes = new Map<string, string | null>();
async function ajuste(clave: string, defecto = ""): Promise<string> {
  if (!cacheAjustes.has(clave)) {
    const { data } = await db.from("ajustes").select("valor").eq("clave", clave).maybeSingle();
    cacheAjustes.set(clave, data?.valor ?? null);
  }
  return cacheAjustes.get(clave) || defecto;
}

async function evento(captura_id: string | null, etapa: string, nivel: "info" | "aviso" | "error", detalle: unknown, ruta: string | null = null) {
  await db.from("eventos").insert({ captura_id, etapa, nivel, ruta, detalle });
}

const cortar = (e: unknown) => String(e instanceof Error ? e.message : e).slice(0, 800);

async function contenidosDe(id: string): Promise<Contenido[]> {
  const { data } = await db.from("contenidos")
    .select("fuente_extraccion, autor, titulo, texto_post, transcripcion, texto_pantalla, enlaces, repos, duracion_s, idioma, medio_ruta, bruto")
    .eq("captura_id", id).order("creado_en");
  return (data ?? []) as Contenido[];
}

async function paso_interpretar(captura: Captura): Promise<Record<string, unknown>> {
  const [contenidos, mapa, reglas] = await Promise.all([
    contenidosDe(captura.id),
    db.from("mapa_cerebro").select("tipo, slug, padre_slug, titulo, ruta").order("ruta").then((r) => r.data ?? []),
    db.from("reglas_clasificacion").select("regla").eq("activa", true).order("creado_en").then((r) => (r.data ?? []).map((x) => x.regla as string)),
  ]);
  const interprete = await ajuste("interprete", "gemini");
  const usarClaude = interprete === "claude" && Boolean(Deno.env.get("ANTHROPIC_API_KEY"));
  const modelo = usarClaude
    ? await ajuste("claude_modelo_interprete", "claude-opus-5-5")
    : await ajuste("gemini_modelo_interprete", "gemini-flash-latest");

  const entrada = armarEntrada(captura, contenidos, mapa, reglas);
  const { datos, modelo: usado, uso } = await interpretar(
    entrada, usarClaude ? "claude" : "gemini", modelo, await ajuste("gemini_modelo_respaldo", "gemini-flash-lite-latest"),
  );

  await db.from("interpretaciones").update({ vigente: false }).eq("captura_id", captura.id).eq("vigente", true);
  const confianza = Math.min(1, Math.max(0, Math.round(Number(datos.confianza ?? 0) * 100) / 100));
  const { data, error } = await db.from("interpretaciones").insert({
    captura_id: captura.id,
    resumen: datos.resumen,
    tipo: datos.tipo,
    skill_destino: datos.skill_destino || null,
    accion: datos.accion,
    confianza,
    razonamiento: datos.razonamiento,
    modelo: usado,
    detalle: {
      titulo: datos.titulo,
      archivo_destino: datos.archivo_destino,
      temas: datos.temas,
      elementos: datos.elementos,
      preguntas_sugeridas: datos.preguntas,
      uso,
    },
  }).select("id").single();
  if (error) throw new Error(`guardar interpretación: ${error.message}`);
  return { interpretacion_id: data.id, tipo: datos.tipo, skill_destino: datos.skill_destino, confianza, modelo: usado };
}

// Margen de tiempo: la función tiene 150 s por llamada. Si la extracción tardó más de esto,
// la interpretación queda para la siguiente llamada (estado 'interpretando').
const MARGEN_INTERPRETAR_MS = 50_000;

async function paso_interpretar_y_cerrar(captura: Captura, resultado: Record<string, unknown>, moverEstado = true): Promise<void> {
  try {
    resultado.interpretacion = await paso_interpretar(captura);
    await evento(captura.id, "interpretacion", "info", resultado.interpretacion);
    if (moverEstado) await db.from("capturas").update({ estado: "extraida", ultimo_error: null }).eq("id", captura.id);
  } catch (e) {
    resultado.interpretacion_error = cortar(e);
    await evento(captura.id, "interpretacion", "aviso", { mensaje: resultado.interpretacion_error, intento: captura.intentos });
    if (!moverEstado) return;
    // La interpretación es un adelanto para la revisión: tras 3 intentos la captura sigue a 'extraida' igual.
    const enReintento = captura.estado === "interpretando";
    const agotada = enReintento && captura.intentos >= 3;
    await db.from("capturas").update(
      agotada
        ? { estado: "extraida" }
        : { estado: "interpretando", ultimo_error: resultado.interpretacion_error, ...(enReintento ? {} : { intentos: 0 }) },
    ).eq("id", captura.id);
  }
}

async function procesar(captura: Captura, solo?: string): Promise<Record<string, unknown>> {
  const t0 = Date.now();
  const resultado: Record<string, unknown> = { captura_id: captura.id, plataforma: captura.plataforma };

  if (solo === "video") {
    const { data: filas } = await db.from("contenidos").select("id, medio_ruta")
      .eq("captura_id", captura.id).eq("fuente_extraccion", "gemini").not("medio_ruta", "is", null).order("creado_en");
    const fila = (filas ?? []).find((f) => !/\.(jpe?g|png|webp)$/.test(f.medio_ruta as string));
    if (!fila) return { ...resultado, error: "sin video guardado en medios" };
    const textoPost = (await contenidosDe(captura.id)).find((c) => c.texto_post)?.texto_post ?? null;
    try {
      const nuevo = await releerVideoGuardado(db, captura, fila.medio_ruta as string, textoPost, ajuste);
      const { error } = await db.from("contenidos").update(nuevo).eq("id", fila.id);
      if (error) throw new Error(`guardar contenido: ${error.message}`);
      await evento(captura.id, "extraccion", "info", { relectura: fila.medio_ruta, ms: Date.now() - t0 });
      resultado.extraccion = { relectura: fila.medio_ruta };
    } catch (e) {
      return { ...resultado, error: cortar(e) };
    }
    await paso_interpretar_y_cerrar(captura, resultado, false);
    resultado.ms = Date.now() - t0;
    return resultado;
  }

  if (solo === "interpretar" || captura.estado === "interpretando") {
    await paso_interpretar_y_cerrar(captura, resultado, captura.estado === "interpretando");
    resultado.ms = Date.now() - t0;
    return resultado;
  }

  try {
    const previos = await contenidosDe(captura.id);
    const { contenidos, ruta } = await extraer(db, captura, previos, ajuste);
    const { error } = await db.from("contenidos").insert(contenidos.map((c) => ({ captura_id: captura.id, ...c })));
    if (error) throw new Error(`guardar contenidos: ${error.message}`);
    await db.from("capturas").update({ ruta_extraccion: ruta, ultimo_error: null }).eq("id", captura.id);
    await evento(captura.id, "extraccion", "info", { ruta, fuentes: contenidos.map((c) => c.fuente_extraccion), ms: Date.now() - t0 }, ruta);
    resultado.extraccion = { ruta, fuentes: contenidos.map((c) => c.fuente_extraccion) };
  } catch (e) {
    const mensaje = cortar(e);
    // Un secreto faltante es un problema de configuración: la captura espera sin gastar intentos.
    // Un video largo con tramos avanzados en esta llamada ("parcial:") tampoco gasta intento.
    const faltaSecreto = mensaje.startsWith("falta el secreto");
    const parcial = mensaje.startsWith("parcial:");
    // Gemini saturado (429/500/503 tras todos los reintentos y respaldos): la captura vuelve a la cola sin gastar intento.
    // Lo mismo si la llamada se acerca a los 150 s de la función ("plazo:").
    const saturado = /^(gemini (429|500|503)|plazo:)/.test(mensaje);
    const sinGasto = faltaSecreto || parcial || saturado;
    const agotada = !sinGasto && captura.intentos >= 3;
    await db.from("capturas").update({
      estado: agotada ? "error" : "recibida",
      ultimo_error: mensaje,
      ...(sinGasto ? { intentos: Math.max(0, captura.intentos - 1) } : {}),
    }).eq("id", captura.id);
    await evento(captura.id, "extraccion", parcial || saturado ? "aviso" : "error", { mensaje, intento: captura.intentos });
    return { ...resultado, error: mensaje, reintento: !agotada };
  }

  if (Date.now() - t0 < MARGEN_INTERPRETAR_MS) {
    await paso_interpretar_y_cerrar(captura, resultado);
  } else {
    // Extracción larga (video extenso): la interpretación corre en la siguiente llamada.
    await db.from("capturas").update({ estado: "interpretando", intentos: 0 }).eq("id", captura.id);
    resultado.interpretacion = "pendiente para la siguiente llamada";
  }
  resultado.ms = Date.now() - t0;
  return resultado;
}

Deno.serve(async (req) => {
  cacheAjustes.clear(); // cada llamada lee los ajustes vigentes
  fijarPlazo(125_000); // margen de 25 s bajo los 150 s para guardar estados y responder
  const url = new URL(req.url);
  const claveEsperada = await ajuste("cron_clave");
  if (!claveEsperada || req.headers.get("x-cerebro-clave") !== claveEsperada) return json({ error: "no autorizado" }, 401);
  const preferido = await ajuste("gemini_proveedor", "vertex");
  const proveedor = await fijarProveedor({
    preferido,
    proyecto: await ajuste("vertex_proyecto"),
    bucket: await ajuste("vertex_bucket"),
    region: await ajuste("vertex_region", "global"),
    alias: await ajuste("vertex_modelos"),
    cuenta: await ajuste("vertex_cuenta"),
    emisor: await ajuste("wif_emisor"),
    audiencia: await ajuste("wif_audiencia"),
    kid: JSON.parse((await ajuste("wif_jwk_publica")) || "{}").kid ?? "",
    privada: preferido === "vertex" ? (await db.rpc("wif_llave")).data ?? null : null,
  });

  if (req.method === "GET" && url.searchParams.get("estado")) {
    const modelos = [...new Set([
      await ajuste("gemini_modelo_video", "gemini-flash-latest"),
      await ajuste("gemini_modelo_interprete", "gemini-flash-latest"),
      ...(await ajuste("gemini_modelo_respaldo")).split(",").map((m) => m.trim()),
    ].filter(Boolean))];
    return json({
      proveedor,
      vertex_listo: Boolean(await ajuste("wif_audiencia")) && Boolean(await ajuste("vertex_cuenta")),
      gemini: Boolean(Deno.env.get("GEMINI_API_KEY")),
      apify: Boolean(Deno.env.get("APIFY_TOKEN")),
      claude: Boolean(Deno.env.get("ANTHROPIC_API_KEY")),
      interprete: await ajuste("interprete", "gemini"),
      modelo_video: await ajuste("gemini_modelo_video", "gemini-flash-latest"),
      ...(url.searchParams.get("probar") ? { prueba_modelos: await probarModelos(modelos) } : {}),
    });
  }

  const cuerpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};

  if (cuerpo.captura_id) {
    const { data: captura } = await db.from("capturas").select("*").eq("id", cuerpo.captura_id).maybeSingle();
    if (!captura) return json({ error: "captura inexistente" }, 404);
    if (!cuerpo.solo && captura.estado !== "interpretando") {
      await db.from("capturas").update({ estado: "extrayendo", intentos: captura.intentos + 1 }).eq("id", captura.id);
      captura.intentos += 1;
    }
    return json(await procesar(captura as Captura, cuerpo.solo));
  }

  if (!hayCredencial()) return json({ procesadas: 0, aviso: "faltan la federación de Vertex y el secreto GEMINI_API_KEY" });
  const lote = Number(await ajuste("procesar_lote", "3")) || 3;
  const { data: capturas, error } = await db.rpc("tomar_capturas", { lote });
  if (error) return json({ error: error.message }, 500);
  const resultados = await Promise.allSettled((capturas ?? []).map((c: Captura) => procesar(c)));
  return json({
    proveedor,
    procesadas: resultados.length,
    resultados: resultados.map((r) => (r.status === "fulfilled" ? r.value : { error: cortar(r.reason) })),
  });
});
