-- Cerebro de skills: revisión de guardados en un hilo de Claude
-- Tramo final del recorrido: ficha con preguntas, respuestas de Angel, propuesta como pull request y aprobación.
-- La conversación ocurre en el hilo «Revisar guardados nuevos» del proyecto de Claude.
-- Cambios aditivos: las tablas de las migraciones anteriores conservan su forma.

-- 1. Preguntas: qué decide cada una, qué opción eligió Angel y en qué mensaje del hilo se hizo
alter table public.preguntas add column if not exists clave text;
alter table public.preguntas add column if not exists respuesta_indice int;
alter table public.preguntas add column if not exists mensaje_hilo text;

-- 2. Propuestas: título, versión, avisos y mensaje del hilo con la tarjeta de aprobación
alter table public.propuestas add column if not exists titulo text;
alter table public.propuestas add column if not exists version int not null default 1;
alter table public.propuestas add column if not exists avisos jsonb not null default '[]'::jsonb;
alter table public.propuestas add column if not exists mensaje_hilo text;

-- El buzón de referencias también entra como propuesta
alter table public.propuestas drop constraint if exists propuestas_tipo_check;
alter table public.propuestas add constraint propuestas_tipo_check
  check (tipo in ('criterio','skill_nueva','sub_skill','prompt','ficha_repo','reorganizacion','referencia'));

-- 3. Cola de revisión: lo que el hilo debe atender en cada despertar
--    listo_para_ficha : extracción terminada (o nota de texto sin nada que extraer)
--    esperando_angel  : ficha enviada, falta su respuesta
--    propuesta_abierta: pull request abierto, falta su aprobación
create or replace view public.cola_revision
with (security_invoker = true) as
select
  c.id,
  c.plataforma,
  c.canal,
  c.url,
  c.nota_angel,
  c.estado,
  c.creado_en,
  case
    when c.estado = 'extraida' or (c.estado = 'recibida' and c.plataforma = 'nota') then 'listo_para_ficha'
    when c.estado = 'esperando_respuesta' then 'esperando_angel'
    when c.estado = 'propuesta' then 'propuesta_abierta'
  end as etapa_revision
from public.capturas c
where c.estado in ('extraida','esperando_respuesta','propuesta')
   or (c.estado = 'recibida' and c.plataforma = 'nota');

-- 4. Conteo rápido para decidir si el hilo trabaja o sigue en silencio
create or replace function public.resumen_revision()
returns table (listos bigint, esperando bigint, propuestas_abiertas bigint, con_error_24h bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    count(*) filter (where etapa_revision = 'listo_para_ficha'),
    count(*) filter (where etapa_revision = 'esperando_angel'),
    count(*) filter (where etapa_revision = 'propuesta_abierta'),
    (select count(*) from public.capturas e where e.estado = 'error' and e.actualizado_en > now() - interval '24 hours')
  from public.cola_revision;
$$;
