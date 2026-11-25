# Stack y skills de Scandalous AI

**Qué es:** un carrusel de cuatro tablas con todo lo que usa Daniel Welsh para su app Scandalous AI, hecha en el hackathon «Ship or Die». Cada fila dice qué eligió y qué alternativa dejó. La última tabla lista las skills de Claude que le hacen el contenido y la tarea que cada una reemplaza.

**Fuente:** [Instagram · danielwelsh_routiq](https://www.instagram.com/p/Df6FpRen905/) · publicado el 2026-11-19, guardado el 2026-11-25.

## Ideas del texto del post

- Casi todo corre en Cloudflare, en el plan de 5 USD al mes. Pasó de Vercel a Cloudflare el segundo día porque Cloudflare sigue más barato si la app llega a 10.000 usuarios.
- Los archivos de los usuarios se revisan (buscan etiquetas ocultas de IA) y se borran al terminar. La app guarda cero archivos.
- Next.js y React para iterar rápido. Claude Code construye; un juego de skills de Claude hace el contenido.
- Pendiente de elegir: herramienta de boletín y contabilidad.

## Infraestructura

| Pieza | Elegida | Alternativa descartada |
| --- | --- | --- |
| Hosting | Cloudflare | Vercel |
| Dominio | Cloudflare DNS | Namecheap |
| Lista de espera | Workers KV | Mailchimp |
| Base de datos | Supabase | Cloudflare D1 |
| Autenticación | Supabase Auth | Clerk |
| Almacenamiento de archivos | Ninguno: se borran | R2, S3 |
| Tokens de IA | Anthropic API | OpenAI API |
| Pagos | Stripe | Lemon Squeezy |
| Correo | Resend | Amazon SES |
| Analítica | PostHog | Google Analytics |
| Errores y disponibilidad | Sentry | Better Stack |
| Prueba de ingresos | TrustMRR | Baremetrics |

## Código y diseño

| Pieza | Elegida | Alternativa descartada |
| --- | --- | --- |
| Framework | Next.js | Ruby on Rails |
| Interfaz | React | Vue |
| Estilos | Tailwind CSS | CSS plano |
| Lenguaje | TypeScript | JavaScript |
| Repositorio | GitHub | GitLab |
| Editor | Cursor | VS Code |
| Agente de código | Claude Code | Codex |
| Modelo | Claude Opus | GPT |
| Diseño | Claude | Figma, Paper, Canva |
| Imágenes y video con IA | Higgsfield | Hedra |

## Negocio

| Pieza | Elegida | Alternativa descartada |
| --- | --- | --- |
| Correo y documentos | Google Workspace | Microsoft 365 |
| Tareas | Linear | ClickUp |
| Grabación de pantalla | Screen Studio | Loom |
| Voz con IA para llamadas salientes | Routiq (empresa del autor) | Vapi |
| Boletín | Por decidir | Kit o Beehiiv |
| Contabilidad | Por decidir | Sheets o Xero |

## Skills de Claude para el contenido

| Skill | Qué hace | Tarea que reemplaza |
| --- | --- | --- |
| `/log-session` | Registra cada grabación | Volver a ver el material |
| `/instagram-content` | Reel, texto y portada | Editar en CapCut |
| `/x-content` | Posts de X desde cada sesión | Escribir desde cero |
| Skills por plataforma | TikTok, Shorts, YouTube, LinkedIn | Un mismo texto para todas |
| `/writing-reel-scripts` | Guiones con el gancho revisado | Adivinar ganchos |
| `/humanizer` | Quita las señales de texto hecho con IA | Reescribir a mano |
| `/motion-craft` | Reglas de animación | After Effects |
| `/ig-cover-refresh` | Portadas de reels con el mismo estilo | Una por una en Canva |
| `/claude-api` | Construyó el bot de respuestas de X | Leer la documentación de la API |
| Claude in Chrome | Publica desde el navegador | Hacer clic a mano |

## Para qué puede servir

- Lista de control al armar el stack de un proyecto nuevo: cada fila es una decisión que tomar, con dos opciones ya comparadas.
- Hosting en Cloudflare para apps que esperan crecer, por costo a escala.
- Ideas de skills de contenido propias: registro de sesiones grabadas, portadas de reels con un estilo fijo, posts por plataforma desde una misma sesión.
