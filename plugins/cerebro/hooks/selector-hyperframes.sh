#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje menciona HyperFrames: abre la galería de extensiones
# (una vez por sesión) y le indica a Claude seguir la skill selector-hyperframes.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
printf '%s' "${prompt:-$entrada}" | grep -qiE 'hyper[ -]?frames' || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/selector-hyperframes/galeria.html"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-selector-hf-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Angel mencionó HyperFrames. Antes de escribir la composición, sigue la skill selector-hyperframes del plugin cerebro: pregunta con AskUserQuestion (selección múltiple) qué extensiones usar, recomienda de una a tres según el pedido e incluye la opción Solo HyperFrames base. ${abierta} Ruta de la galería: ${galeria}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
