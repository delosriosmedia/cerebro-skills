#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje pide escribir o revisar un texto para publicar o enviar
# (copy, anuncio, post, guion, correo, landing, botones...): abre la galería
# de redacción (una vez por sesión) y le indica a Claude seguir la skill
# selector-redaccion, que pregunta si usar edit-copy, humanizer, las dos o ninguna.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

# Piezas de texto que Angel publica o envía.
pieza='(copy|copys|copywriting|correo|e-?mail|mail|post|caption|pie de foto|guion|gui(ó|\\u00f3)n|anuncio|titular|eslogan|slogan|tagline|bio|newsletter|bolet(í|\\u00ed)n|art(í|\\u00ed)culo|landing|microcopy|cta|llamad[ao] a la acci|descripci(ó|\\u00f3)n del producto|texto|textos|mensaje para|carta|propuesta comercial|hilo de x|tweet)'
# Verbos de escribir o pulir.
accion='(escrib|redact|reescrib|mejor|pul[ie]|revis|correg|ajust|arm[ae]|hac(e|er|me)|haz|crea|dame|necesit|quier|prepar|genera|elabor|prop(o|ó|\\u00f3)n|suena|sonar|humaniz|write|draft|rewrite|polish)'

printf '%s' "$texto" | grep -qiE "copywriting|microcopy|humaniz|suena (a|como) (ia|robot|chatgpt|m(á|\\u00e1)quina)|${accion}[^.?!]{0,40}(^|[^a-z])${pieza}([^a-z]|$)|(^|[^a-z])${pieza}[^a-z][^.?!]{0,25}(para|de la pieza|del post|del anuncio|del correo)" || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/selector-redaccion/galeria.html"
skill="$raiz/skills/selector-redaccion/SKILL.md"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-redaccion-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Este pedido toca un texto para publicar o enviar (copy de una pieza, anuncio, post, guion, correo, landing o botones). Antes de entregar el texto, sigue la skill selector-redaccion del plugin cerebro: pregunta con AskUserQuestion, una sola vez por texto, si usar Solo edit-copy, Solo humanizer, Las dos o Ninguna, con una recomendada según la skill. Angel decide; aplica solo lo que elija. Si ya eligió para este mismo texto, aplica esa elección sin volver a preguntar. Si el mensaje es una consulta que no produce un texto, responde sin mencionarlo. ${abierta} Skill: ${skill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
