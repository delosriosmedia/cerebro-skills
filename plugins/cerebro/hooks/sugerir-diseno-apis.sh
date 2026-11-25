#!/usr/bin/env bash
# Hook del plugin cerebro (UserPromptSubmit y PostToolUse de ExitPlanMode).
# Cuando el mensaje de Angel o un plan aprobado describe crear o cambiar una API,
# un endpoint, un webhook o una función en la nube, le recuerda a Claude los
# criterios de desarrollo-backend/criterios/diseno-apis.md. Claude recomienda
# solo las reglas que aplican, y suma la sub-skill auditar-seguridad-ia cuando
# la API llama o expone un modelo de IA. Un aviso por sesión y evento.

entrada="$(cat)"
texto="$(printf '%s' "$entrada" | tr '[:upper:]' '[:lower:]')"

api='(^|[^a-z])(api|apis|rest|endpoint|endpoints|webhook|webhooks)([^a-z]|$)|funci(o|ó)n edge|edge function|cloud function|ruta de la api|rutas de la api|express|fastapi|flask|django rest|nestjs|hono'
accion='(crear|crea |cre[ao]|diseñ|construi|desarroll|implement|arm[ao]|mont[ao]|agreg|añad|sum[ao]|nuevo|nueva|exponer|expón|publicar|desplegar|refactor|versi(o|ó)n|endpoint|plan)'

printf '%s' "$texto" | grep -qiE "$api" || exit 0
printf '%s' "$texto" | grep -qiE "$accion" || exit 0

evento="$(printf '%s' "$entrada" | sed -n 's/.*"hook_event_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
evento="${evento:-UserPromptSubmit}"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-diseno-apis-${evento}-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
criterios="$raiz/skills/desarrollo-backend/criterios/diseno-apis.md"
seguridad="$raiz/skills/automatizacion-ia/sub-skills/auditar-seguridad-ia.md"

contexto="Este trabajo parece crear o cambiar una API, un endpoint, un webhook o una función en la nube. Lee los criterios de diseño de APIs del plugin cerebro y recomienda a Angel en dos o tres líneas solo las reglas que aplican a este caso (por ejemplo, Idempotency-Key si hay cobros o pedidos, paginación por cursor si hay listas que crecen, versión en la ruta si otras apps ya la usan). Aplícalas al escribir el código y cita el criterio usado. Si la API llama o expone un modelo de IA, sugiere también la sub-skill de seguridad con los riesgos que apliquen. Rutas: ${criterios} y ${seguridad}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "$evento" "$contexto"
