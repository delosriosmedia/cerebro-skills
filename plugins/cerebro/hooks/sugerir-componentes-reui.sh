#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje pide un diagrama de Gantt, una tabla editable tipo hoja de
# cálculo, un calendario de eventos, un constructor de filtros o un selector
# anidado (cascader): abre la galería de componentes de ReUI (una vez por
# sesión) y le indica a Claude seguir la skill componentes-reui.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

gantt='(gantt|cronograma|l(i|í)nea de tiempo (de|con) tareas|timeline de tareas)'
grid='(data ?grid|datagrid|tabla (editable|tipo (excel|hoja)|como (excel|hoja de c(a|á)lculo))|hoja de c(a|á)lculo (en|dentro de) (la|mi|una) (app|web)|spreadsheet)'
calendario='(calendario (de eventos|de reservas|con (vistas|arrastr|eventos))|event ?calendar|agenda (de reservas|con calendario)|vista (de )?(mes|semana) y (d(i|í)a|agenda))'
filtros='(filter ?builder|constructor de filtros|filtros avanzados|b(u|ú)squeda avanzada|query builder|constructor de consultas)'
cascader='(cascader|selector (anidado|en cascada|jer(a|á)rquico)|lista anidada|select anidado|men(u|ú) en cascada)'

printf '%s' "$texto" | grep -qiE "$gantt|$grid|$calendario|$filtros|$cascader" || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/componentes-reui/galeria.html"
skill="$raiz/skills/componentes-reui/SKILL.md"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-componentes-reui-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Este pedido incluye un componente React complejo (Gantt, tabla tipo hoja de cálculo, calendario de eventos, constructor de filtros o selector anidado). Si Angel va a construirlo en React, sigue la skill componentes-reui del plugin cerebro: recomienda el componente gratuito de ReUI que encaja, pregunta con AskUserQuestion si usarlo u ofrecer Hacerlo con código propio, y se instala con npx shadcn@latest add @reui/<nombre> tras su aprobación. Si el proyecto usa otra tecnología o el pedido es una consulta puntual, responde sin mencionarlo. ${abierta} Skill: ${skill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
