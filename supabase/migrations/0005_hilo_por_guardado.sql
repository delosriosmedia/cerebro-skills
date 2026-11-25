-- Cerebro de skills: un hilo de Claude por cada guardado.
-- El hilo despachador pide al coordinador un hilo nuevo por cada captura lista y marca despachada_en.
-- El hilo del guardado guarda su propio id en hilo_revision al empezar.

alter table public.capturas add column if not exists despachada_en timestamptz;
alter table public.capturas add column if not exists hilo_revision text;

create or replace view public.cola_revision
with (security_invoker = true) as
select c.id, c.plataforma, c.canal, c.url, c.nota_angel, c.estado, c.creado_en,
  case
    when (c.estado = 'extraida' or (c.estado = 'recibida' and c.plataforma = 'nota'))
         and c.hilo_revision is null
         and (c.despachada_en is null or c.despachada_en < now() - interval '2 hours') then 'listo_para_hilo'
    when c.estado = 'propuesta' then 'propuesta_abierta'
    else 'en_hilo'
  end as etapa_revision,
  c.despachada_en,
  c.hilo_revision
from public.capturas c
where c.estado in ('extraida','esperando_respuesta','redactando','propuesta')
   or (c.estado = 'recibida' and c.plataforma = 'nota');

-- listos = capturas que esperan su hilo; esperando = capturas con hilo abierto
create or replace function public.resumen_revision()
returns table (listos bigint, esperando bigint, propuestas_abiertas bigint, con_error_24h bigint)
language sql stable security invoker set search_path = ''
as $$
  select
    count(*) filter (where etapa_revision = 'listo_para_hilo'),
    count(*) filter (where etapa_revision = 'en_hilo'),
    count(*) filter (where etapa_revision = 'propuesta_abierta'),
    (select count(*) from public.capturas e where e.estado = 'error' and e.actualizado_en > now() - interval '24 hours')
  from public.cola_revision;
$$;
