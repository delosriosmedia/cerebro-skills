#!/usr/bin/env bash
# Hook del plugin cerebro (UserPromptSubmit y PostToolUse de ExitPlanMode).
# Cuando el mensaje de Angel o un plan aprobado describe arrancar o llevar a
# producción una app, un SaaS o un servicio, le recuerda a Claude la sub-skill
# claude-mods/sub-skills/proyecto-produccion-claude-code.md. Claude sugiere solo
# los pasos pendientes que aplican al momento. Un aviso por sesión y evento.

entrada="$(cat)"
texto="$(printf '%s' "$entrada" | tr '[:upper:]' '[:lower:]')"

producto='(app|aplicaci|saas|plataforma|servicio|sitio web|web app|dashboard|panel|mvp|producto)'
arranque='(constru|crea|cre[ao] |desarroll|mont[ao]|arranc|empez|nuev[oa]|desde cero|lanz|producci|desplegar|publicar|stack|arquitectura)'

printf '%s' "$texto" | grep -qiE "$producto" || exit 0
printf '%s' "$texto" | grep -qiE "$arranque" || exit 0

evento="$(printf '%s' "$entrada" | sed -n 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
evento="${evento:-UserPromptSubmit}"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-proyecto-produccion-${evento}-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
subskill="$raiz/skills/claude-mods/sub-skills/proyecto-produccion-claude-code.md"

contexto="Este trabajo parece arrancar o llevar a producción una app o servicio. Si el momento lo amerita (un proyecto nuevo, un plan de arquitectura o un lanzamiento), aplica la lista de ocho pasos de la sub-skill del plugin cerebro y menciona a Angel en una o dos líneas solo los pasos pendientes que aplican ahora. Si es un prototipo rápido o una tarea puntual, continúa sin mencionarlo. Ruta: ${subskill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "$evento" "$contexto"
