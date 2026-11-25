-- Cerebro de skills: captura por mensaje directo de Instagram (fase 2)
-- Aplicado al proyecto Supabase del cerebro el 2026-11-25.
--
-- Angel envía publicaciones y reels a un chat de Instagram que usa solo para guardar ideas.
-- La función instagram-webhook guarda esos mensajes como capturas.

-- Ajustes no secretos que leen las funciones (los secretos viven en Edge Functions > Secrets)
create table if not exists public.ajustes (
  clave text primary key,
  valor text not null,
  actualizado_en timestamptz not null default now()
);
alter table public.ajustes enable row level security;
create trigger ajustes_tocar before update on public.ajustes for each row execute function public.tocar_actualizado();

-- Usuario del chat de captura: se guarda directo en la base, fuera del repositorio público.
--   insert into public.ajustes (clave, valor) values ('instagram_destino_usuario', '<usuario>');
-- La función resuelve y guarda su id interno (instagram_destino_igsid) con el primer mensaje.

-- Nueva plataforma "nota": una idea escrita sin enlace
alter table public.capturas drop constraint capturas_plataforma_check;
alter table public.capturas add constraint capturas_plataforma_check
  check (plataforma in ('instagram','threads','facebook','youtube','github','web','archivo','nota'));

-- Id del mensaje de origen: evita guardar dos veces el mismo mensaje si Meta lo reenvía
alter table public.capturas add column if not exists mensaje_origen_id text;
create unique index if not exists capturas_mensaje_origen_uniq
  on public.capturas (mensaje_origen_id) where mensaje_origen_id is not null;

-- pg_net: permite llamar a las funciones desde SQL (pruebas y tareas programadas)
create extension if not exists pg_net;
