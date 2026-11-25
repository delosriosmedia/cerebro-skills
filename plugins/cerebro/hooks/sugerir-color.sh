#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje trata de los colores de una pieza, interfaz o marca:
# abre la galería de paletas (una vez por sesión) y le indica a Claude
# seguir la skill experto-color (regla 60-30-10 y psicología del color).

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

printf '%s' "$texto" | grep -qiE '60.?30.?10|paleta|palette|colores|color(es)? (de|del|para|en) (la|el|mi|esta|este|una|un)|psicolog(í|i|\\u00ed)a del color|combinaci(ó|o|\\u00f3)n de colou?r|esquema de colou?r|color scheme|colou?r palette|color de acento|color principal|color secundario|tonos de la marca' || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/experto-color/galeria.html"
skill="$raiz/skills/experto-color/SKILL.md"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-color-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería de paletas ya se abrió en el navegador de Angel."
else
  abierta="La galería de paletas ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Este pedido toca los colores de una pieza, interfaz, marca o paleta. Sigue la skill experto-color del plugin cerebro: mide los colores en uso (scripts/medir_color.py con la imagen o con --hex), deja tres, di cuál va al 60, al 30 y al 10, explica qué colores salen o cambian con psicología del color y propone dos o tres paletas de la biblioteca, mostradas en barras o en la galería. Aplica los cambios solo con la aprobación de Angel. Si el mensaje solo menciona el color de pasada, sin trabajo de diseño, responde sin mencionarlo. ${abierta} Skill: ${skill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
