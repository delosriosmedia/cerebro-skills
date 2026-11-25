-- Cerebro de skills: Gemini en Vertex AI (Google Cloud) como proveedor principal de procesar-captura.
-- Vertex lo pagan los créditos de Google Cloud; AI Studio (GEMINI_API_KEY) queda de respaldo.
-- Acceso por federación de identidad: la organización de Google Cloud bloquea llaves de cuentas de servicio,
-- así que Supabase firma su propio JWT (llave privada en el Vault) y publica la llave pública en la función
-- wif-emisor. Los identificadores reales (proyecto, cuenta, bucket, audiencia) se escriben directo en la base
-- de datos, fuera de este repositorio público.

insert into public.ajustes (clave, valor) values
  ('gemini_proveedor', 'vertex'),  -- vertex | aistudio
  ('vertex_proyecto', ''),         -- ID del proyecto de Google Cloud
  ('vertex_cuenta', ''),           -- correo de la cuenta de servicio con los roles de Vertex y del bucket
  ('vertex_bucket', ''),           -- bucket privado de Cloud Storage para videos temporales
  ('vertex_region', 'global'),     -- región del endpoint de Vertex AI
  ('vertex_modelos', ''),          -- alias opcionales "nombre=nombre_en_vertex", separados por comas
  ('wif_emisor', ''),              -- URL de la función wif-emisor (emisor OIDC)
  ('wif_audiencia', '')            -- https://iam.googleapis.com/projects/<n>/locations/global/workloadIdentityPools/<pool>/providers/<prov>
on conflict (clave) do nothing;

-- Guarda el par de llaves una sola vez: privada en el Vault, pública en ajustes.
create or replace function public.wif_guardar_llave(privada text, publica jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from vault.secrets where name = 'wif_vertex_llave') then
    raise exception 'la llave de federación ya existe';
  end if;
  perform vault.create_secret(privada, 'wif_vertex_llave', 'Llave con la que Supabase firma su identidad ante Google Cloud (Vertex AI)');
  insert into public.ajustes (clave, valor) values ('wif_jwk_publica', publica::text)
  on conflict (clave) do update set valor = excluded.valor;
end;
$$;

-- Entrega la llave privada a procesar-captura (solo service_role).
create or replace function public.wif_llave()
returns text
language sql
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'wif_vertex_llave' limit 1;
$$;

revoke all on function public.wif_guardar_llave(text, jsonb) from public, anon, authenticated;
revoke all on function public.wif_llave() from public, anon, authenticated;
grant execute on function public.wif_guardar_llave(text, jsonb) to service_role;
grant execute on function public.wif_llave() to service_role;
