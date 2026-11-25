# assistant-ui (assistant-ui/assistant-ui)

**Qué hace:** Librería de componentes React y TypeScript para construir chats con IA de calidad de producción: respuestas en streaming, archivos adjuntos, herramientas que el modelo ejecuta con su propia tarjeta (UI generativa), aprobación de acciones e historial de conversaciones.

**Enlace y estado:** [github.com/assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) · 13.401 estrellas · último commit 2026-11-24 · MIT · paquete `@assistant-ui/react` 0.15 (React 18 o 19).

**Para qué le sirve a Angel:** skill madre `ux-ui` (subtema `patrones-componentes`). Uso: darle a una app propia un chat con IA en minutos, por ejemplo un asistente que consulta el cerebro o atiende clientes.

**Riesgos:**

- Necesita un backend que hable con el modelo (Vercel AI SDK, LangGraph u otro) y su clave de API guardada en el servidor.
- Versión 0.x con cambios frecuentes; fijar la versión en `package.json`.
- Un chat con herramientas abre la puerta a inyección de prompts: aplicar la sub-skill `automatizacion-ia/sub-skills/auditar-seguridad-ia.md`.

**Instalación propuesta** (dentro del proyecto donde se use, con Claude Code, tras la aprobación de Angel):

```bash
# Proyecto nuevo con chat listo
npx assistant-ui@latest create mi-chat
# Proyecto Next.js existente
npx assistant-ui@latest init
```

**Decisión:** pendiente · 2026-11-25. La sugiere el hook `plugins/cerebro/hooks/sugerir-herramientas-ia.sh` y la muestra la galería de la skill `selector-herramientas-ia`.

**Fuente:** [carrusel «GitHub is an absolute gold mine»](https://www.instagram.com/p/Df90pdYE1M2/), Instagram, rakeshmahantiai1 · guardado el 2026-11-25.
