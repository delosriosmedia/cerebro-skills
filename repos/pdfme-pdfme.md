# pdfme (pdfme/pdfme)

**Qué hace:** Librería en TypeScript que genera PDF a partir de una plantilla JSON y datos. Trae un diseñador visual en React para armar la plantilla arrastrando textos, imágenes, tablas, códigos de barras y QR, y un visor. Funciona en el navegador y en Node.js.

**Enlace y estado:** [github.com/pdfme/pdfme](https://github.com/pdfme/pdfme) · 5.089 estrellas · último commit 2026-11-20 · MIT · paquetes `@pdfme/*` 6.2.

**Para qué le sirve a Angel:** skill madre `desarrollo-backend`. Uso: producir en serie facturas, certificados, cotizaciones o informes con el mismo diseño, desde una app o una función en la nube.

**Riesgos:**

- Las fuentes con tildes y eñes deben cargarse en la plantilla (por ejemplo Inter o Noto Sans) para que el PDF las muestre bien.
- Dependencias livianas, sin servicios externos ni claves.

**Instalación propuesta** (dentro del proyecto donde se use, con Claude Code, tras la aprobación de Angel):

```bash
npm install @pdfme/generator @pdfme/common @pdfme/schemas
# Diseñador visual de plantillas dentro de una app React
npm install @pdfme/ui
```

Para probar sin instalar: el playground oficial enlazado en el README del repositorio.

**Decisión:** pendiente · 2026-11-25. La sugiere el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` y la muestra la galería de la skill `selector-herramientas-ia`.

**Fuente:** [carrusel «GitHub is an absolute gold mine»](https://www.instagram.com/p/Df90pdYE1M2/), Instagram, rakeshmahantiai1 · guardado el 2026-11-25.
