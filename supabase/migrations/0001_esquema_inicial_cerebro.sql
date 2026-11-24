-- Cerebro de skills: esquema inicial (fase 1)
-- Aplicado al proyecto Supabase del cerebro el 2026-11-24.

create extension if not exists pgcrypto;

create or replace function public.tocar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- 1. Capturas: cada enlace o archivo que entra al sistema
create table public.capturas (
  id uuid primary key default gen_random_uuid(),
  canal text not null check (canal in ('telegram','youtube_lista','importacion','correo','dm_instagram','atajo','manual')),
  plataforma text not null check (plataforma in ('instagram','threads','facebook','youtube','github','web','archivo')),
  url text,
  url_normalizada text,
  nota_angel text,
  estado text not null default 'recibida' check (estado in (
    'recibida','extrayendo','extraida','interpretando','esperando_respuesta',
    'redactando','propuesta','aprobada','descartada','archivada','error')),
  intentos int not null default 0,
  ruta_extraccion text,
  ultimo_error text,
  telegram_chat_id bigint,
  telegram_mensaje_id bigint,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create unique index capturas_url_normalizada_uniq on public.capturas (url_normalizada) where url_normalizada is not null;
create index capturas_estado_idx on public.capturas (estado, creado_en);
create trigger capturas_tocar before update on public.capturas for each row execute function public.tocar_actualizado();

-- 2. Contenidos: lo extraído de cada captura
create table public.contenidos (
  id uuid primary key default gen_random_uuid(),
  captura_id uuid not null references public.capturas(id) on delete cascade,
  fuente_extraccion text not null check (fuente_extraccion in ('apify','gemini','youtube_api','github_api','dm_instagram','manual','otra')),
  autor text,
  titulo text,
  texto_post text,
  transcripcion text,
  texto_pantalla text,
  enlaces jsonb not null default '[]'::jsonb,
  repos jsonb not null default '[]'::jsonb,
  duracion_s int,
  idioma text,
  medio_ruta text,
  bruto jsonb,
  creado_en timestamptz not null default now()
);
create index contenidos_captura_idx on public.contenidos (captura_id);

-- 3. Interpretaciones: lo que Claude entendió y dónde lo ubicaría
create table public.interpretaciones (
  id uuid primary key default gen_random_uuid(),
  captura_id uuid not null references public.capturas(id) on delete cascade,
  resumen text not null,
  tipo text not null check (tipo in ('criterio','skill_nueva','sub_skill','prompt','repositorio','herramienta','flujo','referencia')),
  skill_destino text,
  accion text not null check (accion in ('crear','ampliar','agregar_criterio','agregar_prompt','instalar','archivar')),
  confianza numeric(3,2) check (confianza between 0 and 1),
  razonamiento text,
  modelo text,
  vigente boolean not null default true,
  creado_en timestamptz not null default now()
);
create index interpretaciones_captura_idx on public.interpretaciones (captura_id) where vigente;

-- 4. Preguntas: lo que el bot le pregunta a Angel
create table public.preguntas (
  id uuid primary key default gen_random_uuid(),
  captura_id uuid not null references public.capturas(id) on delete cascade,
  interpretacion_id uuid references public.interpretaciones(id) on delete cascade,
  orden int not null default 1,
  texto text not null,
  opciones jsonb not null default '[]'::jsonb,
  opcion_recomendada int,
  respuesta text,
  respondida_en timestamptz,
  telegram_mensaje_id bigint,
  creado_en timestamptz not null default now()
);
create index preguntas_pendientes_idx on public.preguntas (creado_en) where respuesta is null;

-- 5. Propuestas: cambios al cerebro que esperan aprobación
create table public.propuestas (
  id uuid primary key default gen_random_uuid(),
  captura_id uuid references public.capturas(id) on delete set null,
  interpretacion_id uuid references public.interpretaciones(id) on delete set null,
  origen text not null default 'captura' check (origen in ('captura','consolidacion','manual')),
  tipo text not null check (tipo in ('criterio','skill_nueva','sub_skill','prompt','ficha_repo','reorganizacion')),
  skill_destino text,
  ruta_archivo text,
  contenido text not null,
  rama text,
  pr_numero int,
  pr_url text,
  estado text not null default 'borrador' check (estado in ('borrador','enviada','aprobada','cambios_pedidos','descartada','fusionada')),
  comentarios text,
  creado_en timestamptz not null default now(),
  decidido_en timestamptz,
  actualizado_en timestamptz not null default now()
);
create index propuestas_estado_idx on public.propuestas (estado, creado_en);
create trigger propuestas_tocar before update on public.propuestas for each row execute function public.tocar_actualizado();

-- 6. Mapa del cerebro: índice de skills, sub-skills, criterios y fichas
create table public.mapa_cerebro (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('skill_madre','sub_skill','archivo_criterios','biblioteca_prompts','ficha_repo')),
  slug text not null,
  padre_slug text,
  titulo text not null,
  descripcion text,
  ruta text not null unique,
  total_criterios int not null default 0,
  actualizado_en timestamptz not null default now()
);
create index mapa_padre_idx on public.mapa_cerebro (padre_slug);
create trigger mapa_tocar before update on public.mapa_cerebro for each row execute function public.tocar_actualizado();

-- 7. Correcciones de Angel: reglas que guían futuras interpretaciones
create table public.reglas_clasificacion (
  id uuid primary key default gen_random_uuid(),
  regla text not null,
  ejemplo_captura_id uuid references public.capturas(id) on delete set null,
  activa boolean not null default true,
  creado_en timestamptz not null default now()
);

-- 8. Eventos: bitácora de cada paso, base del reporte de salud
create table public.eventos (
  id bigint generated always as identity primary key,
  captura_id uuid references public.capturas(id) on delete cascade,
  etapa text not null,
  nivel text not null default 'info' check (nivel in ('info','aviso','error')),
  ruta text,
  detalle jsonb,
  creado_en timestamptz not null default now()
);
create index eventos_captura_idx on public.eventos (captura_id, creado_en);
create index eventos_fecha_idx on public.eventos (creado_en);

-- Seguridad: todo cerrado al público; solo las funciones del servidor (service role) leen y escriben
alter table public.capturas enable row level security;
alter table public.contenidos enable row level security;
alter table public.interpretaciones enable row level security;
alter table public.preguntas enable row level security;
alter table public.propuestas enable row level security;
alter table public.mapa_cerebro enable row level security;
alter table public.reglas_clasificacion enable row level security;
alter table public.eventos enable row level security;

-- Vista de salud semanal por plataforma y ruta
create view public.salud_semanal
with (security_invoker = true) as
select
  c.plataforma,
  coalesce(c.ruta_extraccion, 'sin_ruta') as ruta,
  count(*) as capturas,
  count(*) filter (where c.estado in ('extraida','interpretando','esperando_respuesta','redactando','propuesta','aprobada','descartada','archivada')) as extraidas,
  count(*) filter (where c.estado = 'error') as con_error,
  round(100.0 * count(*) filter (where c.estado <> 'error') / nullif(count(*),0), 1) as tasa_exito_pct
from public.capturas c
where c.creado_en > now() - interval '7 days'
group by 1, 2;

-- Bucket privado para videos, audios y capturas de pantalla (50 MB por archivo)
insert into storage.buckets (id, name, public, file_size_limit)
values ('medios', 'medios', false, 52428800)
on conflict (id) do nothing;
