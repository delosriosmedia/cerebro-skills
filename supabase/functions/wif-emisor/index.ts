// wif-emisor: emisor OIDC propio del cerebro para la federación de identidad con Google Cloud.
// Google lee aquí la llave pública con la que verifica los JWT que firma procesar-captura (gemini.ts),
// y los cambia por un token de la cuenta de servicio de Vertex AI. La llave privada vive en el Vault.
//
//   GET  …/wif-emisor/.well-known/openid-configuration → documento de descubrimiento OIDC.
//   GET  …/wif-emisor/jwks                              → llave pública (ajuste wif_jwk_publica).
//   POST {"generar": true}  + cabecera x-cerebro-clave  → crea el par de llaves una sola vez:
//        la privada va al Vault (wif_vertex_llave) y la pública al ajuste wif_jwk_publica.
//        Nadie ve la privada: se genera y se guarda dentro de la función.

import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const ajuste = async (clave: string) => (await db.from("ajustes").select("valor").eq("clave", clave).maybeSingle()).data?.valor ?? "";
const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" } });

Deno.serve(async (req) => {
  const ruta = new URL(req.url).pathname;
  const emisor = await ajuste("wif_emisor");

  if (req.method === "GET" && ruta.endsWith("/.well-known/openid-configuration")) {
    return json({
      issuer: emisor,
      jwks_uri: `${emisor}/jwks`,
      id_token_signing_alg_values_supported: ["RS256"],
      response_types_supported: ["id_token"],
      subject_types_supported: ["public"],
    });
  }
  if (req.method === "GET" && ruta.endsWith("/jwks")) {
    const publica = await ajuste("wif_jwk_publica");
    return json({ keys: publica ? [JSON.parse(publica)] : [] });
  }

  if (req.method === "POST") {
    if (req.headers.get("x-cerebro-clave") !== await ajuste("cron_clave")) return json({ error: "no autorizado" }, 401);
    const cuerpo = await req.json().catch(() => ({}));
    if (!cuerpo.generar) return json({ error: "nada que hacer" }, 400);
    const par = await crypto.subtle.generateKey(
      { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"],
    );
    const privada = encodeBase64(new Uint8Array(await crypto.subtle.exportKey("pkcs8", par.privateKey)));
    const jwk = await crypto.subtle.exportKey("jwk", par.publicKey);
    const kid = `cerebro-${new Date().toISOString().slice(0, 10)}`;
    const publica = { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", use: "sig", kid };
    const { error } = await db.rpc("wif_guardar_llave", { privada, publica });
    if (error) return json({ error: error.message }, 409);
    return json({ listo: true, kid });
  }
  return json({ error: "ruta desconocida" }, 404);
});
