#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando Angel va a diseñar la portada de un carrusel, la primera imagen de un
# post o la miniatura de un video: abre la galería de diez técnicas de portada
# (una vez por sesión) y le indica a Claude seguir la skill portadas-scroll.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

pieza='(portada|cover|miniatura|thumbnail|primera (diapositiva|l(a|á|\\u00e1)mina|imagen|slide)|first slide)'
contexto_redes='(carrusel|carousel|post|publicaci|reel|instagram|linkedin|tiktok|youtube|video|redes|feed)'
directo='(frenar el scroll|frene el scroll|detener el scroll|scroll.?stopper|stop the scroll|portada de(l)? carrusel|carousel cover|miniatura de youtube|youtube thumbnail)'

if ! printf '%s' "$texto" | grep -qiE "$directo"; then
  printf '%s' "$texto" | grep -qiE "$pieza" || exit 0
  printf '%s' "$texto" | grep -qiE "$contexto_redes" || exit 0
fi

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/portadas-scroll/galeria.html"
skill="$raiz/skills/portadas-scroll/SKILL.md"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-portadas-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Angel va a diseñar una portada para redes (carrusel, post o miniatura). Sigue la skill portadas-scroll del plugin cerebro: pregunta con AskUserQuestion cuáles de las diez técnicas usar (foto con trazo, la mirada, la cifra exacta, tachado en rojo, el disfraz, antes y después, el corte, el raro entre iguales, la palabra que actúa, A o B), recomienda una o dos según el tema, y aplica la elegida junto con composicion-grafica y experto-color. Si el pedido es una consulta puntual o un ajuste pequeño, responde sin mencionarla. ${abierta} Skill: ${skill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
