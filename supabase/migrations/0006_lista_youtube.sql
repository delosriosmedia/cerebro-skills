-- Cerebro de skills: entrada desde la lista «Cerebro» de YouTube
-- Programa la función youtube-lista cada 10 minutos con pg_cron + pg_net.
--
-- Valores que viven solo en la base (tabla public.ajustes), fuera del repositorio:
--   funciones_url     URL base de las funciones del proyecto (https://<proyecto>.supabase.co/functions/v1)
--   youtube_lista_id  id de la lista «Cerebro»
--   cron_clave        clave aleatoria que la función exige en la cabecera x-cerebro-clave
-- Secreto de la función (Edge Functions > Secrets): YOUTUBE_API_KEY.

create extension if not exists pg_cron;

insert into public.ajustes (clave, valor)
values ('cron_clave', encode(extensions.gen_random_bytes(24), 'hex'))
on conflict (clave) do nothing;

select cron.schedule(
  'youtube-lista',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := (select valor from public.ajustes where clave = 'funciones_url') || '/youtube-lista',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cerebro-clave', (select valor from public.ajustes where clave = 'cron_clave')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  )
  where exists (select 1 from public.ajustes where clave = 'funciones_url');
  $$
);
