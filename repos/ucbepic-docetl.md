# DocETL (ucbepic/docetl)

**Qué hace:** Sistema de la Universidad de Berkeley para procesar muchos documentos con modelos de lenguaje. Se describe una tubería en YAML con operaciones (map, reduce, filter, resolve) y DocETL la ejecuta, la optimiza en costo y precisión y devuelve tablas consultables. Incluye DocWrangler, una interfaz para armar la tubería mirando resultados.

**Enlace y estado:** [github.com/ucbepic/docetl](https://github.com/ucbepic/docetl) · 4.275 estrellas · último commit 2026-11-17 · MIT · paquete `docetl` 0.3.0 en PyPI.

**Para qué le sirve a Angel:** skill madre `automatizacion-ia` (subtema `flujos-agentes`). Uso: analizar cientos de textos a la vez, como transcripciones de videos, comentarios o los guardados del cerebro, y sacar temas, categorías o resúmenes agregados.

**Riesgos:**

- Cada operación llama al modelo por documento: el costo crece con el volumen. Conviene probar con una muestra pequeña antes.
- Envía el contenido al proveedor de modelos configurado (usa LiteLLM, así que acepta OpenAI, Gemini, Anthropic y otros).
- Proyecto académico con mantenimiento activo; la versión 0.x puede cambiar su formato de YAML.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install python@3.12
python3.12 -m venv ~/Herramientas-IA/docetl-env
source ~/Herramientas-IA/docetl-env/bin/activate
pip install docetl
export GEMINI_API_KEY=...   # o la clave del proveedor elegido
docetl run tuberia.yaml
```

**Decisión:** pendiente · 2026-11-25. La sugiere el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` y la muestra la galería de la skill `selector-herramientas-ia`.

**Fuente:** [carrusel «GitHub is an absolute gold mine»](https://www.instagram.com/p/Df90pdYE1M2/), Instagram, rakeshmahantiai1 · guardado el 2026-11-25.
