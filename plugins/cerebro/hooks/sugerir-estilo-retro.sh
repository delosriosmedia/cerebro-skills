#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando Angel va a diseñar o construir una interfaz visual (app, web, landing,
# panel, componente, pantalla), le pide a Claude sumar «Estilo retro» como una
# opción más en la pregunta de estilo, junto a las skills que ya usa. Angel la
# marca o la deja pasar. Un aviso por sesión; un pedido retro explícito
# recibe además su propio aviso.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

accion='(diseñ|disen|dise\\u00f1|redise|crea|constru|haz |hazme|arma|maquet|prototip|build|design|make )'
interfaz='(interfaz|interfaces|(^|[^a-z])ui([^a-z]|$)|landing|p(a|á|\\u00e1)gina web|sitio web|(^|[^a-z])web([^a-z]|$)|(^|[^a-z])apps?([^a-z]|$)|aplicaci|dashboard|tablero|panel|pantalla|componente|reproductor|configurador|portafolio|frontend|front-end|website|screen|component)'
retro='(retro|y2k|200[0-9]|2milero|winamp|nost(a|á|\\u00e1)lgic|arcade|aparato|consola|crt|pixel)'

printf '%s' "$texto" | grep -qiE "$interfaz" || exit 0
printf '%s' "$texto" | grep -qiE "$accion|$retro" || exit 0

sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
tipo=general
printf '%s' "$texto" | grep -qiE "$retro" && tipo=retro
marca="${TMPDIR:-/tmp}/cerebro-estilo-retro-${tipo}-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
skill="$raiz/skills/estilo-retro/SKILL.md"
galeria="$raiz/skills/estilo-retro/galeria.html"

if [ "$tipo" = retro ]; then
  contexto="Angel pidió una interfaz con aire retro. Sigue la skill estilo-retro del plugin cerebro: abre la galería, pregunta con AskUserQuestion qué estilo usar y entrega el brief a la skill dueña del estilo. Skill: ${skill} · Galería: ${galeria}"
else
  contexto="Angel va a diseñar una interfaz visual. Cuando le preguntes por el estilo o por la skill de diseño a usar (impeccable, design-taste-frontend, hallmark u otra), suma una opción más: «Estilo retro (16 estilos con galería: aparato, Y2K, ventanas clásicas, terminal, arcade, vaporwave y más)», descrita en una línea, sin recomendarla salvo que el producto lo pida. Si no hay pregunta de estilo en este flujo, menciónala en una sola línea como alternativa disponible. Si Angel la elige, sigue la skill estilo-retro del plugin cerebro y abre su galería; si no, sigue sin volver a mencionarla. Si el pedido es una consulta puntual o un ajuste pequeño, omite la sugerencia. Skill: ${skill} · Galería: ${galeria}"
fi
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
