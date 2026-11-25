#!/usr/bin/env bash
# Hook del plugin cerebro (UserPromptSubmit y PostToolUse de ExitPlanMode).
# Cuando Angel planea un proyecto de código o pide auditarlo o reestructurarlo,
# le recuerda a Claude la skill piramide-reglas (criterio C-003 de
# claude-mods/criterios/flujos-claude.md). Claude la ofrece en una o dos líneas,
# con el comando para llamarla, y Angel decide si la usa. Un aviso por sesión y modo.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

evento="$(printf '%s' "$entrada" | sed -n 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
evento="${evento:-UserPromptSubmit}"

proyecto='(proyecto|repo|repositorio|c(o|ó|\\u00f3)digo|codebase|(^|[^a-z])apps?([^a-z]|$)|aplicaci|saas|servicio|backend|frontend|monorepo|agentes? de c(o|ó|\\u00f3)digo|claude code)'
planear='(planea|planific|plan de|arquitectura|estructur|desde cero|proyecto nuevo|nuevo proyecto|arranc|empez|claude\.md|agents\.md|reglas (para|del|de los) (el |los )?agente)'
auditar='(audit|reestructur|refactor|reorganiz|deuda t(e|é|\\u00e9)cnica|el agente (sigue|vuelve|repite)|mismo error|sigue fallando|vuelve a fallar|otra vez el mismo|se repite el error)'

modo=""
if [ "$evento" = "PostToolUse" ]; then
  printf '%s' "$texto" | grep -qiE "$planear" && modo=planear
else
  printf '%s' "$texto" | grep -qiE "$proyecto" || exit 0
  if printf '%s' "$texto" | grep -qiE "$auditar"; then modo=auditar
  elif printf '%s' "$texto" | grep -qiE "$planear"; then modo=planear
  fi
fi
[ -n "$modo" ] || exit 0

sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-piramide-reglas-${modo}-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
skill="$raiz/skills/piramide-reglas/SKILL.md"

if [ "$modo" = auditar ]; then
  contexto="Angel quiere auditar o reestructurar un proyecto de código, o el agente repite errores. Ofrécele en una o dos líneas la skill piramide-reglas del plugin cerebro en modo auditar: inventaría las reglas del proyecto, ubica cada una en uno de cinco pisos (diseño del código, análisis estático, verificación en ejecución, texto, revisión humana) y propone bajar al piso más bajo las que hoy viven solo en CLAUDE.md o en la memoria del agente. Dile cómo llamarla: /cerebro:piramide-reglas auditar. Si Angel acepta, sigue la skill; si es una corrección puntual, continúa sin mencionarla. Skill: ${skill}"
else
  contexto="Angel está planeando un proyecto de código o su arquitectura. Ofrécele en una o dos líneas la skill piramide-reglas del plugin cerebro en modo planear: lista las reglas del proyecto y decide en qué piso vive cada una (diseño del código, análisis estático, verificación en ejecución, texto, revisión humana), para que dependan lo menos posible de que el agente las recuerde. Dile cómo llamarla: /cerebro:piramide-reglas planear. Si Angel acepta, sigue la skill; si es un prototipo rápido o una tarea puntual, continúa sin mencionarla. Skill: ${skill}"
fi
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "$evento" "$contexto"
