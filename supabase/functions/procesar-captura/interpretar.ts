// Interpretación: lee el contenido extraído junto con el mapa del cerebro y las reglas aprendidas,
// decide qué es el guardado y dónde encaja, y redacta las preguntas para Angel.
// Intérprete configurable en la tabla `ajustes` (clave `interprete`): "gemini" (por defecto) o "claude".

import Anthropic from "npm:@anthropic-ai/sdk@1.8.0";
import { geminiJSON } from "./gemini.ts";
import type { Captura, Contenido } from "./extraer.ts";

export type Interpretacion = {
  titulo: string;
  resumen: string;
  tipo: "criterio" | "skill_nueva" | "sub_skill" | "prompt" | "repositorio" | "herramienta" | "flujo" | "referencia";
  skill_destino: string;
  archivo_destino: string;
  accion: "crear" | "ampliar" | "agregar_criterio" | "agregar_prompt" | "instalar" | "archivar";
  confianza: number;
  razonamiento: string;
  temas: string[];
  elementos: { clase: string; titulo: string; contenido: string }[];
  preguntas: { texto: string; opciones: string[]; opcion_recomendada: number }[];
};

export const ESQUEMA_INTERPRETACION = {
  type: "object",
  additionalProperties: false,
  properties: {
    titulo: { type: "string", description: "Nombre corto del aprendizaje, en español" },
    resumen: { type: "string", description: "Qué enseña el guardado, en dos a cuatro frases en español" },
    tipo: { type: "string", enum: ["criterio", "skill_nueva", "sub_skill", "prompt", "repositorio", "herramienta", "flujo", "referencia"] },
    skill_destino: { type: "string", description: "Destino en formato madre/subtema (por ejemplo prompts/prompts-video o claude-mods/skills-plugins); nueva:<slug> si abre un dominio; buzon si es referencia" },
    archivo_destino: { type: "string", description: "Ruta del archivo del repositorio donde quedaría" },
    accion: { type: "string", enum: ["crear", "ampliar", "agregar_criterio", "agregar_prompt", "instalar", "archivar"] },
    confianza: { type: "number", description: "Entre 0 y 1" },
    razonamiento: { type: "string", description: "Por qué ese destino, en dos o tres frases" },
    temas: { type: "array", items: { type: "string" } },
    elementos: {
      type: "array",
      description: "Piezas aprovechables: cada criterio, prompt literal, paso, repositorio o herramienta",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          clase: { type: "string", enum: ["criterio", "prompt", "paso", "repositorio", "herramienta", "idea"] },
          titulo: { type: "string" },
          contenido: { type: "string" },
        },
        required: ["clase", "titulo", "contenido"],
      },
    },
    preguntas: {
      type: "array",
      description: "Entre una y tres preguntas para Angel",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          texto: { type: "string" },
          opciones: { type: "array", items: { type: "string" } },
          opcion_recomendada: { type: "integer", description: "Índice desde 0 de la opción recomendada" },
        },
        required: ["texto", "opciones", "opcion_recomendada"],
      },
    },
  },
  required: ["titulo", "resumen", "tipo", "skill_destino", "archivo_destino", "accion", "confianza", "razonamiento", "temas", "elementos", "preguntas"],
};

export const SISTEMA_INTERPRETE = `Eres el intérprete del cerebro de skills de Angel.
Angel guarda en redes sociales contenido sobre inteligencia artificial, diseño, prompts, automatización, Claude y producción de video. Cada guardado se convierte en conocimiento aprobado dentro de un plugin de skills para Claude.

Tu trabajo con cada guardado:
1. Entender qué enseña, usando la transcripción, el texto en pantalla, el texto del post y la nota de Angel. La nota de Angel manda: si dice para qué lo guardó, ese es el propósito.
2. Elegir el tipo y el destino según esta tabla:
   - criterio → un consejo o regla puntual. Destino: plugins/cerebro/skills/<skill>/criterios/<subtema>.md. Acción agregar_criterio.
   - sub_skill → un procedimiento completo con pasos dentro de un dominio existente. Destino: plugins/cerebro/skills/<skill>/<sub-skill>/SKILL.md. Acción crear o ampliar.
   - skill_nueva → un procedimiento o dominio que queda fuera de las seis skills madre. skill_destino = nueva:<slug>. Acción crear.
   - prompt → un prompt listo para usar. Destino: plugins/cerebro/skills/prompts/biblioteca/<tema>-<nombre-corto>.md. Acción agregar_prompt.
   - repositorio → un repo, servidor MCP, plugin o mod de Claude. Destino: repos/<owner>-<nombre>.md (ficha de evaluación). Acción instalar.
   - herramienta → una app o servicio sin repo. Destino: repos/<nombre>.md. Acción instalar.
   - flujo → una automatización o flujo de trabajo de varios servicios. Destino: sub-skill en automatizacion-ia o claude-mods.
   - referencia → interesante, sin uso claro todavía. Destino: buzon/AAAA-MM-DD-<tema>.md. Acción archivar.
   skill_destino usa el formato madre/subtema del mapa (por ejemplo diseno-grafico/tipografia o prompts/biblioteca); para un repo usa la skill madre que más lo aprovecha seguida de /repos.
   Un guardado puede traer varias piezas; elige el destino principal y lista todas las piezas en "elementos" (prompts copiados literalmente, criterios redactados como regla aplicable, repos como owner/nombre).
   En guardados de diseño o motion, cada animación o microinteracción relevante es una pieza propia, con su disparador, movimiento, duración y efectos, redactada para poder recrearla.
3. Respetar las reglas de clasificación aprendidas de Angel por encima de tu criterio.
4. Redactar de una a tres preguntas para Angel:
   - La primera confirma la lectura y el destino, con el destino recomendado como opción 0.
   - Las demás solo si cambian el resultado: qué partes conservar, si instalar algo, si el prompt va tal cual o adaptado.
   - Cada pregunta: una frase directa; de dos a cuatro opciones cortas (máximo 40 caracteres cada una); la última puede ser "Descartar".
   - Confianza alta (0.85 o más) y destino obvio: una sola pregunta.

Estilo: español, frases cortas, redacción directa y afirmativa que describe lo que cada cosa es. Evita las construcciones de contraste por negación ("no es X, sino Y").
Responde solo con el JSON pedido.`;

export function armarEntrada(
  captura: Captura,
  contenidos: Contenido[],
  mapa: { tipo: string; slug: string; padre_slug: string | null; titulo: string; ruta: string }[],
  reglas: string[],
): string {
  const mapaTexto = mapa.map((m) => `- [${m.tipo}] ${m.padre_slug ? m.padre_slug + "/" : ""}${m.slug}: ${m.titulo} → ${m.ruta}`).join("\n");
  const reglasTexto = reglas.length ? reglas.map((r) => `- ${r}`).join("\n") : "- (ninguna todavía)";
  const bloques = contenidos.map((c, i) => {
    const b = (c.bruto ?? {}) as Record<string, unknown>;
    const extra = ["descripcion_visual", "animaciones", "prompts_visibles", "pasos", "herramientas"]
      .filter((k) => b[k] && (!Array.isArray(b[k]) || (b[k] as unknown[]).length))
      .map((k) => `${k}: ${typeof b[k] === "string" ? b[k] : JSON.stringify(b[k])}`);
    return [
      `### Fuente ${i + 1}: ${c.fuente_extraccion}`,
      c.titulo && `Título: ${c.titulo}`,
      c.autor && `Autor: ${c.autor}`,
      c.idioma && `Idioma: ${c.idioma}`,
      c.texto_post && `Texto del post:\n${c.texto_post}`,
      c.transcripcion && `Transcripción:\n${c.transcripcion}`,
      c.texto_pantalla && `Texto en pantalla:\n${c.texto_pantalla}`,
      ...extra,
      c.enlaces?.length && `Enlaces: ${c.enlaces.join(", ")}`,
      c.repos?.length && `Repos: ${c.repos.join(", ")}`,
    ].filter(Boolean).join("\n");
  });
  return `## Mapa del cerebro
${mapaTexto}

## Reglas de clasificación aprendidas
${reglasTexto}

## Guardado
Plataforma: ${captura.plataforma}
Enlace: ${captura.url ?? "(sin enlace)"}
Nota de Angel: ${captura.nota_angel ?? "(sin nota)"}

${bloques.join("\n\n")}`.slice(0, 400_000);
}

export async function interpretar(
  entrada: string,
  interprete: string,
  modelo: string,
  respaldo?: string,
): Promise<{ datos: Interpretacion; modelo: string; uso: unknown }> {
  if (interprete === "claude") {
    const client = new Anthropic(); // lee ANTHROPIC_API_KEY
    const r = await client.beta.messages.create({
      model: modelo,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: ESQUEMA_INTERPRETACION } },
      system: SISTEMA_INTERPRETE,
      messages: [{ role: "user", content: entrada }],
    } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming);
    if (r.stop_reason === "refusal") throw new Error("claude declinó la interpretación");
    const texto = r.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    return { datos: JSON.parse(texto) as Interpretacion, modelo: r.model, uso: r.usage };
  }
  const { datos, uso } = await geminiJSON<Interpretacion>({
    modelo,
    sistema: SISTEMA_INTERPRETE,
    esquema: ESQUEMA_INTERPRETACION,
    respaldo,
    partes: [{ text: entrada }],
  });
  return { datos, modelo, uso };
}
