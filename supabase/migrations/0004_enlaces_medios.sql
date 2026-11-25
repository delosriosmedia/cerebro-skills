-- Cerebro de skills: enlaces firmados a los medios de una captura, para los fotogramas de cada ficha.
-- El hilo de revisión llama a esta función desde SQL; la clave interna se lee aquí y nunca pasa por la conversación.
-- Uso: select public.pedir_enlaces_medios('<captura_id>');  → id de la solicitud
--      select status_code, content from net._http_response where id = <id>;  (unos segundos después)

create or replace function public.pedir_enlaces_medios(p_captura uuid)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_clave text;
begin
  select a.valor into v_base from public.ajustes a where a.clave = 'funciones_url';
  select a.valor into v_clave from public.ajustes a where a.clave = 'cron_clave';
  return net.http_post(
    url := v_base || '/medios-enlace',
    body := jsonb_build_object('captura_id', p_captura),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cerebro-clave', v_clave)
  );
end;
$$;

revoke all on function public.pedir_enlaces_medios(uuid) from public, anon, authenticated;
