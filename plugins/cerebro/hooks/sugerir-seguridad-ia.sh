#!/usr/bin/env bash
# Hook del plugin cerebro (UserPromptSubmit y PostToolUse de ExitPlanMode).
# Cuando el mensaje de Angel o un plan aprobado describe una app, agente o flujo
# que usa un modelo de lenguaje, le recuerda a Claude la sub-skill
# automatizacion-ia/sub-skills/auditar-seguridad-ia.md. Claude decide si el momento
# lo amerita y sugiere solo los riesgos que aplican. Un aviso por sesión y evento.

entrada="$(cat)"
texto="$(printf '%s' "$entrada" | tr '[:upper:]' '[:lower:]')"

ia='(llm|modelo de lenguaje|agente|agent|chatbot|asistente con ia|rag|embedding|base vectorial|mcp|prompt del sistema|system prompt|openai|anthropic|claude api|api de claude|gemini|gpt|ollama|langchain|tool use|herramientas del modelo)'
proyecto='(app|aplicaci|proyecto|plan|construir|crear|desarrollar|implementar|integrar|desplegar|lanzar|publicar|producci|backend|api|webhook|automatiz|flujo|funci[oó]n edge|servidor)'

printf '%s' "$texto" | grep -qiE "$ia" || exit 0
printf '%s' "$texto" | grep -qiE "$proyecto" || exit 0

evento="$(printf '%s' "$entrada" | sed -n 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
evento="${evento:-UserPromptSubmit}"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-seguridad-ia-${evento}-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
subskill="$raiz/skills/automatizacion-ia/sub-skills/auditar-seguridad-ia.md"

contexto="Este trabajo parece involucrar una app, agente o flujo con un modelo de lenguaje. Si el momento lo amerita (un plan, una herramienta nueva para el agente, datos de usuarios, una API de pago o un lanzamiento), sugiere a Angel en una o dos líneas la sub-skill de seguridad del plugin cerebro, nombrando solo los riesgos que aplican a este proyecto según su paso 2. Si el trabajo es un prototipo personal sin datos ni acciones sensibles, continúa sin mencionarlo. Ruta: ${subskill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "$evento" "$contexto"
