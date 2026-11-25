# Humanizer (blader/humanizer)

**Qué hace:** Skill que reescribe un texto escrito con IA para que suene a una persona, con el mismo contenido. Revisa 26 patrones sacados de la guía de Wikipedia «Signs of AI writing»: contrastes «no es X, sino Y», remates de una línea, frases que suenan profundas, entradas preparadas («La clave es…»), tríos forzados, rayas en exceso, lenguaje de venta, palabras comodín, etiquetas en negrita y relleno. Se usa con `/humanizer` o pidiéndolo en palabras.

**Enlace y estado:** [github.com/blader/humanizer](https://github.com/blader/humanizer) · unas 73.000 estrellas · último commit 2026-11-19 · MIT · skill versión 4.0.0.

**Para qué le sirve a Angel:** skill madre `claude-mods`. Uso: pulir guiones, textos para redes, correos y documentación antes de publicarlos, y revisar que Claude cumpla la regla de redacción afirmativa del repositorio (el contraste «no es X, sino Y» es el patrón número 1 de Humanizer).

**Relación con lo que ya existe:**

| Skill | Dónde vive | Cuándo usarla |
| --- | --- | --- |
| `edit-copy` | skills portables de Angel | Textos de producto, interfaz, landing y documentación: precisión, datos que respaldan cada frase y voz de marca |
| `humanizer` | skills portables de Angel | Cualquier texto en prosa: quitar las señales de escritura con IA y dejar el ritmo de una persona |

Se complementan: primero `edit-copy` ajusta qué dice el texto de producto; después `humanizer` limpia cómo suena. Las dos se activan solo cuando Angel las elige: el hook `plugins/cerebro/hooks/sugerir-redaccion.sh` detecta cada pedido de texto y la skill `selector-redaccion` le muestra la galería y le pregunta cuál usar.

**Riesgos:**

- Los ejemplos y la lista de palabras están en inglés. La skill trata igual la construcción equivalente en otro idioma, así que en español detecta bien los contrastes por negación y los remates; las palabras comodín conviene revisarlas a mano.
- El patrón 21 marca las comillas curvas. En español se usan comillas latinas («»), que quedan fuera de ese patrón; si la skill sugiere cambiarlas, se conservan.
- Sin claves de API ni servicios externos. El script `scripts/validate-package.py` solo valida el paquete.
- Requiere Claude Code 2.1.142 o superior para instalarla como plugin.

**Instalación:** copiar la skill a la carpeta `skills/humanizer/` del plugin de skills portables de Angel, así llega a todos sus equipos con el plugin de siempre. Instalación directa como plugin, si se prefiere aparte:

```text
/plugin marketplace add blader/humanizer
/plugin install humanizer@humanizer
```

**Decisión:** instalada · 2026-11-25, como copia de la versión 4.0.0 con `disable-model-invocation: true`, junto al selector de redacción.

**Fuente:** [lámina «You don't need a better model. You need these 10 repos.»](https://www.instagram.com/p/DfrsUrYiPFW/), Instagram, codewithaltin · guardado el 2026-11-25. Ponytail, Hallmark, Impeccable y Graphify, de la misma lámina, ya estaban entre las skills portables de Angel.
