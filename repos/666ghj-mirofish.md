# MiroFish (666ghj/MiroFish)

**Qué hace:** Motor de predicción con miles de agentes de IA. Recibe una idea o un material semilla (un informe, una noticia, una propuesta de negocio) y crea miles de personas simuladas, cada una con carácter, memoria y conducta propias. Las pone a conversar en dos redes sociales simuladas, una tipo Twitter y otra tipo foro, y al final un agente de informes entrega quién apoya la idea, quién la rechaza y por qué. Después se puede conversar con cualquier persona simulada o con el agente de informes.

**Enlace y estado:** [github.com/666ghj/MiroFish](https://github.com/666ghj/MiroFish) · 86.600 estrellas · último commit 2026-10-16 · AGPL-3.0. Variante en inglés que corre todo en local con Neo4j y Ollama: [nikmcfly/MiroFish-Offline](https://github.com/nikmcfly/MiroFish-Offline) (AGPL-3.0).

**Para qué le sirve a Angel:** skill madre `automatizacion-ia` (subtema `flujos-agentes`). Uso: ensayar una idea de negocio, propia o de un cliente, antes de invertir. El informe muestra los puntos débiles (precio, privacidad, miedos del público) y las conversaciones con las personas simuladas dan pistas para ajustar la oferta. También sirve en la auditoría de una app o web terminada o recién publicada: se describe la app y se simula cómo la recibe su público.

**Hook:** `plugins/cerebro/hooks/sugerir-mirofish.sh` sugiere este ensayo cuando Angel pide auditar una app o web terminada o cuenta que acaba de lanzarla o publicarla. Cuando la app usa un modelo de lenguaje, el hook `sugerir-seguridad-ia.sh` suma la auditoría de seguridad.

**Cómo leer el resultado:** las personas simuladas son una IA representando a un público. El informe sirve como ensayo para encontrar objeciones; la demanda real se confirma con clientes reales.

**Riesgos:**

- Gasta muchos tokens. Sus creadores recomiendan empezar con menos de 40 rondas de simulación.
- Pide dos claves: un modelo de lenguaje con formato compatible con OpenAI y Zep Cloud para la memoria (cuota gratis mensual para uso simple).
- La configuración de ejemplo apunta a Qwen de Alibaba. La idea que se simula viaja al proveedor del modelo elegido; para ideas confidenciales conviene la variante local con Ollama.
- `npm run setup:all` instala dependencias de Node y de Python y ejecuta sus scripts de instalación.
- Licencia AGPL-3.0: uso interno libre; ofrecerlo como servicio a terceros obliga a publicar el código modificado.
- Documentación principal en chino, con README en inglés.

**Instalación propuesta** (en el Mac, con Claude Code, tras la aprobación de Angel):

```bash
# 1. Requisitos: Node 18+, Python 3.11 o 3.12 y uv
brew install node python@3.12 uv

# 2. Código
git clone https://github.com/666ghj/MiroFish.git && cd MiroFish
cp .env.example .env
```

```env
# 3. Claves en .env (Angel las pega; nunca entran al repositorio)
# Opción sugerida: Gemini por su endpoint compatible con OpenAI
LLM_API_KEY=<clave de Google AI Studio>
LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL_NAME=gemini-flash-latest
# Memoria: crear cuenta gratis en https://app.getzep.com/
ZEP_API_KEY=<clave de Zep Cloud>
```

```bash
# 4. Dependencias y arranque
npm run setup:all
npm run dev        # interfaz en http://localhost:3000, servidor en el puerto 5001
```

Alternativa con Docker: `docker compose up -d` con el mismo `.env`.

**Primer ensayo sugerido:**

1. Describir la idea en un párrafo: qué se vende, a quién y a qué precio.
2. Configurar menos de 40 rondas y revisar el consumo de tokens al terminar.
3. Leer el informe (quién sí, quién no, por qué) y preguntar a dos o tres personas simuladas qué las haría cambiar de opinión.

**Decisión:** pendiente · 2026-11-25. Angel eligió ficha con plan de instalación; se instala cuando Angel lo pida.

**Fuente:** [reel de @andrea.eskailet](https://www.instagram.com/p/DgAhDSPjXh-/), Instagram, publicado el 2026-11-21 · guardado el 2026-11-25.
