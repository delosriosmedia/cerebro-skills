#!/usr/bin/env bash
# Hook UserPromptSubmit del plugin cerebro.
# Cuando el mensaje trata de generar PDF, extraer datos de documentos, procesar
# lotes de textos con IA o poner un chat con IA en una app: abre la galería de
# herramientas (una vez por sesión) y le indica a Claude seguir la skill
# selector-herramientas-ia.

entrada="$(cat)"
prompt="$(printf '%s' "$entrada" | sed -n 's/.*"prompt"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p')"
texto="$(printf '%s' "${prompt:-$entrada}" | tr '[:upper:]' '[:lower:]')"

pdf='((generar|crear|exportar|hacer|armar|plantilla)[^.]{0,30}pdf|pdf[^.]{0,20}(plantilla|en serie|autom)|(generar|crear|hacer|armar|emitir)[^.]{0,30}(facturas|certificados|cotizaciones))'
extraer='((extraer|sacar|leer|convertir|procesar|analizar|clasificar|resumir)[^.]{0,40}(documento|pdf|factura|contrato|formulario|escaneo|transcripci|comentarios)|documentos? a json|\betl\b|datos estructurados)'
chat='((interfaz|ui|componente|ventana|widget)[^.]{0,20}(de )?chat|chat[^.]{0,30}(react|next|app|web|ia)|chatbot|asistente[^.]{0,20}(en|dentro de) (la|mi|una) app)'

printf '%s' "$texto" | grep -qiE "$pdf|$extraer|$chat" || exit 0

raiz="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
galeria="$raiz/skills/selector-herramientas-ia/galeria.html"
skill="$raiz/skills/selector-herramientas-ia/SKILL.md"
sesion="$(printf '%s' "$entrada" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
marca="${TMPDIR:-/tmp}/cerebro-herramientas-ia-${sesion:-sin-sesion}"

if [ ! -e "$marca" ]; then
  touch "$marca"
  if command -v open >/dev/null 2>&1; then open "$galeria" >/dev/null 2>&1 &
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$galeria" >/dev/null 2>&1 &
  fi
  abierta="La galería visual ya se abrió en el navegador de Angel."
else
  abierta="La galería ya se abrió antes en esta sesión; ábrela de nuevo si Angel la pide."
fi

contexto="Este pedido toca PDF en serie, extracción de datos de documentos, análisis de textos en lote o un chat con IA. Si Angel va a construirlo, sigue la skill selector-herramientas-ia del plugin cerebro: recomienda la herramienta que encaja (pdfme, Unstract, DocETL o assistant-ui), pregunta con AskUserQuestion cuál usar y ofrece Hacerlo con código propio. Si el pedido es una consulta puntual, responde sin mencionarlo. ${abierta} Skill: ${skill}"
contexto="${contexto//\\/\\\\}"
contexto="${contexto//\"/\\\"}"
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$contexto"
