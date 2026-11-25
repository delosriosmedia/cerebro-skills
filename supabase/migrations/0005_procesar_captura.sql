-- Cerebro de skills: etapa de procesamiento (extracción con Gemini/Apify + interpretación)
-- Función Edge: supabase/functions/procesar-captura
-- Aplicada al proyecto Supabase del cerebro el 2026-11-25.

-- 1. Detalle de cada interpretación: piezas aprovechables, temas y preguntas sugeridas para Angel
alter table public.interpretaciones add column if not exists detalle jsonb;

-- 2. Ajustes de la etapa (valores no secretos; las claves viven en los secretos de Edge Functions)
insert into public.ajustes (clave, valor) values
  ('interprete', 'gemini'),                              -- gemini | claude
  ('gemini_modelo_video', 'gemini-flash-latest'),
  ('gemini_modelo_interprete', 'gemini-flash-latest'),
  ('claude_modelo_interprete', 'claude-opus-5-5'),
  ('procesar_lote', '3')
on conflict (clave) do nothing;

-- 3. Toma un lote de capturas listas para extraer y las marca como 'extrayendo'.
--    Espera 3 minutos desde la llegada para que la nota de Angel alcance a pegarse.
--    Reintenta capturas atascadas en 'extrayendo' más de 10 minutos, hasta 3 intentos.
create or replace function public.tomar_capturas(lote int default 3)
returns setof public.capturas
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Las que agotaron sus intentos pasan a error
  update public.capturas
     set estado = 'error',
         ultimo_error = coalesce(ultimo_error, 'agotó los intentos de extracción')
   where estado = 'extrayendo'
     and intentos >= 3
     and actualizado_en < now() - interval '10 minutes';

  return query
  update public.capturas c
     set estado = 'extrayendo', intentos = c.intentos + 1
   where c.id in (
     select id from public.capturas
      where plataforma <> 'nota'
        and intentos < 3
        and (
          (estado = 'recibida' and creado_en < now() - interval '3 minutes')
          or (estado = 'extrayendo' and actualizado_en < now() - interval '10 minutes')
        )
      order by creado_en
      limit lote
      for update skip locked
   )
  returning c.*;
end;
$$;

revoke all on function public.tomar_capturas(int) from public, anon, authenticated;

-- 4. Llamada periódica a la función (cada 5 minutos), con la misma clave compartida que usa youtube-lista
select cron.schedule(
  'procesar-captura',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := (select valor from public.ajustes where clave = 'funciones_url') || '/procesar-captura',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cerebro-clave', (select valor from public.ajustes where clave = 'cron_clave')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 150000
  )
  where exists (select 1 from public.capturas where estado in ('recibida','extrayendo') and plataforma <> 'nota');
  $cron$
);
