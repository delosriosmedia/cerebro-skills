# Unstract (Zipstack/unstract)

**Qué hace:** Plataforma que convierte documentos sueltos (PDF, escaneos, correos, facturas) en JSON estructurado. Se define qué extraer con prompts en un «Prompt Studio» y el resultado se publica como API o como tubería ETL hacia una base de datos.

**Enlace y estado:** [github.com/Zipstack/unstract](https://github.com/Zipstack/unstract) · 7.471 estrellas · último commit 2026-11-24 · AGPL-3.0.

**Para qué le sirve a Angel:** skill madre `automatizacion-ia` (subtema `flujos-agentes`). Uso: sacar campos fijos de documentos que llegan en lote, por ejemplo facturas, contratos o formularios escaneados, y guardarlos directo en Supabase.

**Riesgos:**

- Licencia AGPL-3.0: un servicio público que la modifique debe publicar su código. Para uso interno aplica sin cambios.
- Corre con Docker y varios contenedores; pide una máquina con unos 8 GB de RAM libres.
- Envía el texto de cada documento al proveedor de modelos que se configure (OpenAI, Gemini, Anthropic u otro); documentos con datos personales requieren revisar ese proveedor antes.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
brew install --cask docker   # abrir Docker Desktop una vez
git clone https://github.com/Zipstack/unstract.git ~/Herramientas-IA/unstract
cd ~/Herramientas-IA/unstract
./run-platform.sh
# Panel: http://frontend.unstract.localhost (usuario y clave iniciales en el README)
```

Después, en el panel: conectar el modelo (clave de Gemini o Claude), crear un proyecto en Prompt Studio y publicarlo como API.

**Decisión:** pendiente · 2026-11-25. La sugiere el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` y la muestra la galería de la skill `selector-herramientas-ia`.

**Fuente:** [carrusel «GitHub is an absolute gold mine»](https://www.instagram.com/p/Df90pdYE1M2/), Instagram, rakeshmahantiai1 · guardado el 2026-11-25.
