# Diseño de APIs

**Alcance:** Aquí viven los criterios para diseñar APIs REST propias: nombres de rutas, métodos HTTP, idempotencia, paginación, filtros, anidamiento, límites de uso, versionado y autenticación.

## Criterios

### C-001 · Sustantivos en la ruta, acción en el método
- **Regla:** Nombra cada recurso con un sustantivo en plural y minúsculas (`/api/productos`, `/api/productos/42`). La acción la indica el método: POST crea, GET lee, PUT actualiza y DELETE borra.
- **Cuándo aplica:** Al definir las rutas de cualquier API nueva o al revisar rutas con verbos como `/api/getProductos` o `/api/borrarProducto?id=42`.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-002 · Idempotency-Key en operaciones que cobran o crean
- **Regla:** GET, PUT y DELETE ya dan el mismo resultado si se repiten. Para POST y PATCH, pide una cabecera `Idempotency-Key`: en la primera petición el servidor ejecuta y guarda la clave; en el reintento la reconoce y devuelve la misma respuesta.
- **Cuándo aplica:** Pagos, pedidos, envíos de mensajes y cualquier POST que un reintento de red pueda duplicar.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-003 · Paginación por cursor en listas grandes
- **Regla:** Devuelve las listas largas por páginas con `?limit=`. Usa cursor (`?limit=3&cursor=item_3`) en tablas grandes o con inserciones frecuentes; el offset (`?limit=3&offset=3`) sirve para listas pequeñas y estables.
- **Cuándo aplica:** Cualquier endpoint que devuelva colecciones que crecen con el tiempo.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-004 · Filtros y orden por parámetros de consulta
- **Regla:** Deja que el cliente pida justo lo que necesita con parámetros: `GET /productos?talla=M&sort=-fecha`. El signo menos en `sort` indica orden descendente.
- **Cuándo aplica:** Endpoints de listado donde el cliente filtra o reordena resultados.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-005 · Anidar hasta dos niveles
- **Regla:** Anida en la ruta lo que está relacionado, con un máximo de dos niveles: `/carritos/123/productos/321`. Más allá, usa rutas propias o parámetros.
- **Cuándo aplica:** Recursos que pertenecen a otro, como productos de un carrito o comentarios de una publicación.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-006 · Rate limiting con 429 y Retry-After
- **Regla:** Fija una cuota de peticiones por cliente (por ejemplo, 100 por minuto). Al superarla, responde `429 Too Many Requests` con la cabecera `Retry-After` para que el cliente sepa cuándo reintentar.
- **Cuándo aplica:** Toda API expuesta a clientes externos o a usuarios finales. Para fijar topes de tokens y de gasto en apps con IA, ver también la regla LLM06 de la sub-skill de seguridad de `automatizacion-ia`.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-007 · Versión en la ruta
- **Regla:** Incluye la versión en la ruta (`/api/v1/`). Publica una `v2` cuando cambie el formato de respuesta y mantén la `v1` activa hasta retirarla con aviso.
- **Cuándo aplica:** Cambios que alteran campos, tipos o estructura de las respuestas que ya usan otras apps.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

### C-008 · HTTPS y token validado en cada llamada
- **Regla:** Sirve la API solo por HTTPS y valida el token (`Authorization: Bearer`) en cada petición, en el gateway o en el servicio. Una petición sin token válido recibe `401 Unauthorized`.
- **Cuándo aplica:** Toda API con datos privados o acciones que cambian estado.
- **Fuente:** [Carrusel de @chanti.dev](https://www.instagram.com/p/DgIOHbujntN/) · 2026-11-24

## Formato de cada criterio

```markdown
### C-000 · <título corto>
- **Regla:** <la indicación en una o dos frases>
- **Cuándo aplica:** <situación>
- **Fuente:** <enlace> · <fecha>
```
