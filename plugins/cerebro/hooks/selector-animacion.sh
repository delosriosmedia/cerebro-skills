#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje pide una animación: abre la galería de estilos
# (una vez por sesión) y le indica a Claude seguir la skill selector-animacion.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
printf '%s' "${prompt:-$entrada}" | grep -qiE 'animaci(o|ó|\\u00f3)n|animation' || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/selector-animacion/galeria.html"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-selector-anim-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Angel mencionó una animación. Si pide crear una animación o un video animado, antes de escribir código sigue la skill selector-animacion del plugin cerebro: pregunta con AskUserQuestion qué estilo usar, recomienda de uno a tres según su historia y ofrece Otro estilo. ${abierta} Ruta de la galería: ${galeria}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
