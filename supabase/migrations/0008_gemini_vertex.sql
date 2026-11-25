-- Cerebro de skills: Gemini en Vertex AI (Google Cloud) como proveedor principal de procesar-captura.
-- Vertex lo pagan los créditos de Google Cloud; AI Studio (GEMINI_API_KEY) queda de respaldo.
-- El nombre real del bucket se escribe directo en la base de datos, fuera del repositorio.

insert into public.ajustes (clave, valor) values
  ('gemini_proveedor', 'vertex'),  -- vertex | aistudio
  ('vertex_bucket', ''),           -- bucket privado de Cloud Storage para videos temporales
  ('vertex_region', 'global'),     -- región del endpoint de Vertex AI
  ('vertex_modelos', '')           -- alias opcionales "nombre=nombre_en_vertex", separados por comas
on conflict (clave) do nothing;
