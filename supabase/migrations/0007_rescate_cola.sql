-- 0007 · Rescate del historial del chat de captura de Instagram
--
-- Qué hace: guarda en rescate_cola los posts y reels que Angel envió al chat de captura
-- antes de que existiera el webhook (fuente: exportación de datos de Meta), del más reciente
-- al más antiguo. Cada 10 minutos, pg_cron llama rescate_siguiente_lote(), que registra los
-- 10 siguientes como capturas cuando ninguna captura rescatada sigue abierta. Así Angel revisa
-- de a 10 y el lote nuevo entra solo al cerrar el último hilo del anterior.
--
-- Los datos de la cola se cargan aparte (no van en el repositorio).

create table if not exists public.rescate_cola (
  orden int primary key,
  codigo text not null unique,
  tipo text not null check (tipo in ('p','reel')),
  enviado_utc timestamptz not null,
  nota_angel text,
  captura_id uuid references public.capturas(id),
  registrado_en timestamptz
);
alter table public.rescate_cola enable row level security;

create or replace function public.rescate_siguiente_lote(forzar boolean default false)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0; nueva uuid; existente uuid;
begin
  if not forzar and exists (
    select 1 from capturas where mensaje_origen_id like 'recuperada:%'
      and estado not in ('aprobada','descartada','archivada','error')) then
    return 0;
  end if;
  for r in select * from rescate_cola where captura_id is null order by orden limit 10 loop
    select id into existente from capturas
      where url ilike '%/'||r.codigo||'/%' or url_normalizada ilike '%/'||r.codigo limit 1;
    if existente is not null then
      update rescate_cola set captura_id = existente, registrado_en = now() where orden = r.orden;
      continue;
    end if;
    insert into capturas (canal, plataforma, url, url_normalizada, ruta_extraccion, mensaje_origen_id, nota_angel)
    values ('dm_instagram','instagram','https://www.instagram.com/'||r.tipo||'/'||r.codigo||'/',
            'https://instagram.com/p/'||r.codigo,'apify',
            'recuperada:'||to_char(r.enviado_utc at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'), r.nota_angel)
    returning id into nueva;
    update rescate_cola set captura_id = nueva, registrado_en = now() where orden = r.orden;
    n := n + 1;
  end loop;
  if n > 0 then
    insert into eventos (etapa, nivel, ruta, detalle)
    values ('rescate_lote','info','dm_instagram', jsonb_build_object('registradas', n,
      'pendientes', (select count(*) from rescate_cola where captura_id is null)));
  end if;
  return n;
end $$;
revoke all on function public.rescate_siguiente_lote(boolean) from public, anon, authenticated;

select cron.schedule('rescate-siguiente-lote', '*/10 * * * *', $$select public.rescate_siguiente_lote()$$);
