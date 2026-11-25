#!/usr/bin/env bash
# Hook del plugin cerebro (UserPromptSubmit).
# Cuando Angel pide auditar o revisar una app o web terminada, o cuenta que
# acaba de lanzarla o publicarla, le recuerda a Claude la ficha de MiroFish
# (repos/666ghj-mirofish.md): simular cómo reacciona su público antes o justo
# después del lanzamiento. Complementa al hook sugerir-seguridad-ia.sh, que cubre
# la seguridad cuando la app usa un modelo de lenguaje. Un aviso por sesión.

entrada="$(cat)"
texto="$(printf '%s' "$entrada" | tr '[:upper:]' '[:lower:]')"

producto='(^|[^a-z])(app|apps|aplicaci|web|sitio|p(a|á)gina|landing|plataforma|producto|tienda|saas|servicio)'
momento='(auditor|audita|auditar|revisi(o|ó)n final|revisa(r)? (la|mi|el|esta|este)|terminad|lista para (lanzar|publicar|salir)|ya (est(a|á) lista|qued(o|ó))|lanzamiento|lanc(e|é)|lanzar|lanzamos|public(a|á)r|publiqu(e|é)|publicamos|reci(e|é)n (publicad|lanzad|sal)|en producci(o|ó)n|sali(o|ó) (al aire|en vivo)|go live|en vivo)'

printf '%s' "$texto" | grep -qiE "$producto" || exit 0
printf '%s' "$texto" | grep -qiE "$momento" || exit 0

sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-mirofish-${sesion:-sin-sesion}"
[ -e "$marca" ] && exit 0
touch "$marca"

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
ficha="$(cd "$raiz/../.." 2>/dev/null && pwd)/repos/666ghj-mirofish.md"
[ -e "$ficha" ] || ficha="repos/666ghj-mirofish.md del repositorio delosriosmedia/cerebro-skills"

contexto="Angel está auditando una app o web terminada, o acaba de lanzarla o publicarla. Además de la auditoría que pidió, sugiérele en una o dos líneas un ensayo de público con MiroFish: describir la app (qué ofrece, a quién y a qué precio) y simular cómo reaccionan miles de personas, para encontrar objeciones de precio, confianza, privacidad o mensaje. Si MiroFish aún está sin instalar en su Mac, ofrece instalarlo con el plan de la ficha. Recuerda que es un ensayo con IA: las objeciones se confirman con usuarios reales. Si la app usa un modelo de lenguaje, la seguridad la cubre la sub-skill auditar-seguridad-ia. Ficha: ${ficha}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
