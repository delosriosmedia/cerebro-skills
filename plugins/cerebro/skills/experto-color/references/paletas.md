# Biblioteca de paletas 60-30-10

Archivo generado por `scripts/generar.py` desde `scripts/paletas.json`. Para sumar una paleta, se edita el JSON y se corre el script.

Cada paleta trae tres colores con su rol: el 60 es el fondo o lienzo, el 30 lleva tarjetas, bloques y texto, y el 10 es el acento para el llamado a la acción o el dato clave. Los contrastes se miden con la fórmula de WCAG: el 30 sobre el 60 debe llegar a 4,5 si lleva texto, y el 10 sobre el 60 a 3 como mínimo.

**Cómo elegir:** filtra por sector y por emoción, luego por modo (claro u oscuro). Si la marca ya tiene un color, búscalo como 10 o como 60 y conserva la estructura de la paleta cambiando ese tono por el de la marca; vuelve a medir con `medir_color.py --hex`.

## Tecnología y software

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Índigo eléctrico** (claro) | Niebla `#F5F5FA` | Índigo noche `#1E1B4B` | Índigo vivo `#5B5BF0` | Confianza moderna, precisión | Landing de software, panel de producto, presentación técnica | Monocromática | 14.7 · 4.6 · `#FFFFFF` 5.0 |
| **Terminal lima** (oscuro) | Grafito `#0E1116` | Hielo `#E6EDF3` | Lima `#A3E635` | Energía técnica, velocidad | Herramientas para desarrolladores, demos de código, miniaturas tech | Base neutra + acento | 16.0 · 12.5 · `#000000` 13.9 |
| **Cian frío** (oscuro) | Marino profundo `#0B1E2D` | Bruma `#DCE7F0` | Cian `#22D3EE` | Futuro, claridad, calma tecnológica | IA, datos, ciberseguridad, tableros | Base neutra + acento | 13.5 · 9.4 · `#000000` 11.6 |

## Finanzas

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Banca serena** (claro) | Perla `#F4F6F8` | Azul banca `#0F2A4A` | Verde crecimiento `#15803D` | Seguridad, orden, crecimiento | Bancos, seguros, apps de ahorro, informes financieros | Tríada o compuesta | 13.4 · 4.6 · `#FFFFFF` 5.0 |
| **Oro sobrio** (oscuro) | Marino `#0F1B2D` | Marfil `#E9E4D8` | Oro viejo `#C9A227` | Solidez, patrimonio, exclusividad | Inversión, banca privada, consultoría | Base neutra + acento | 13.6 · 7.1 · `#000000` 8.7 |
| **Fintech joven** (claro) | Blanco `#FFFFFF` | Tinta `#111827` | Violeta `#7C3AED` | Novedad, cercanía, ambición | Billeteras digitales, cripto, apps para jóvenes | Base neutra + acento | 17.7 · 5.7 · `#FFFFFF` 5.7 |

## Salud

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Clínica calma** (claro) | Agua `#F2F7F6` | Verde azulado `#134E4A` | Coral `#C8553D` | Calma, cuidado, limpieza | Clínicas, odontología, telemedicina | Complementaria | 8.8 · 4.0 · `#000000` 4.8 |
| **Farmacia** (claro) | Blanco clínico `#F7FAF9` | Verde botica `#0B3D2E` | Ámbar `#B45309` | Confianza clínica, acción rápida | Droguerías, suplementos, laboratorios | Tríada o compuesta | 11.6 · 4.8 · `#FFFFFF` 5.0 |

## Bienestar

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Spa** (claro) | Lino `#F6F1EA` | Salvia `#5E6B5A` | Terracota `#A65A3F` | Descanso, naturalidad, tibieza | Spa, yoga, cosmética natural, retiros | Base neutra + acento | 5.0 · 4.5 · `#FFFFFF` 5.1 |

## Alimentos

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Cocina cálida** (claro) | Crema `#FFF8EE` | Chocolate `#3B2416` | Tomate `#D9480F` | Apetito, hogar, calidez | Restaurantes, recetas, domicilios | Monocromática | 13.7 · 4.1 · `#000000` 4.9 |
| **Fresco** (claro) | Hoja clara `#F7FBF2` | Verde huerta `#1F3D2B` | Mandarina `#C2410C` | Frescura, salud, origen | Comida saludable, mercados, jugos | Tríada o compuesta | 11.4 · 4.9 · `#FFFFFF` 5.2 |
| **Comida rápida** (oscuro) | Carbón `#1A1A1A` | Pan `#FFF4E0` | Mostaza `#FFC233` | Antojo, energía, urgencia | Hamburguesas, pizza, promociones nocturnas | Base neutra + acento | 16.0 · 10.8 · `#000000` 13.0 |

## Lujo y moda

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Noir dorado** (oscuro) | Negro tinta `#0D0D0D` | Seda `#F2EDE4` | Oro `#B8934A` | Elegancia, misterio, exclusividad | Joyería, perfumes, hoteles, licores | Base neutra + acento | 16.7 · 6.8 · `#000000` 7.3 |
| **Champaña** (claro) | Champaña `#F3EEE7` | Grafito cálido `#2B2A28` | Borgoña `#8C1C2B` | Refinamiento, calma, deseo | Moda, bodas, vinos, editorial | Base neutra + acento | 12.4 · 7.9 · `#FFFFFF` 9.1 |
| **Esmeralda** (oscuro) | Esmeralda noche `#0E2A22` | Hueso `#EDE6D6` | Oro brillante `#D4AF37` | Riqueza, tradición, naturaleza noble | Lujo clásico, golf, té, marcas heredadas | Base neutra + acento | 12.3 · 7.3 · `#000000` 10.0 |

## Ecología

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Bosque** (claro) | Musgo claro `#F1F4EC` | Pino `#2F4A33` | Calabaza `#B45309` | Naturaleza, equilibrio, compromiso | ONG ambientales, turismo rural, productos orgánicos | Tríada o compuesta | 8.8 · 4.5 · `#FFFFFF` 5.0 |
| **Océano** (claro) | Espuma `#EEF5F7` | Abismo `#0D3B4F` | Coral vivo `#D9452B` | Frescura, amplitud, cuidado del agua | Turismo de playa, conservación marina, agua | Complementaria | 10.8 · 3.9 · `#000000` 4.8 |

## Educación

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Pizarra feliz** (claro) | Papel `#FFFDF6` | Azul pizarra `#24346B` | Rojo lápiz `#E03E2F` | Curiosidad, confianza, alegría | Cursos, colegios, contenido educativo | Tríada o compuesta | 11.6 · 4.2 · `#000000` 4.9 |

## Infantil

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Juego** (claro) | Cielo claro `#F4F7FF` | Morado tinta `#2D2A6E` | Naranja juego `#E8590C` | Diversión, energía, seguridad | Juguetes, apps infantiles, eventos familiares | Tríada o compuesta | 11.7 · 3.3 · `#000000` 5.9 |

## Entretenimiento y gaming

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Neón** (oscuro) | Negro azulado `#0A0A12` | Plata `#E5E7F0` | Fucsia neón `#FF2E88` | Adrenalina, noche, rebeldía | Gaming, streaming, fiestas, música electrónica | Base neutra + acento | 16.0 · 5.6 · `#000000` 6.0 |
| **Arcade** (oscuro) | Violeta noche `#14102A` | Lavanda `#EAE6FF` | Menta eléctrica `#00E5A0` | Juego, recompensa, futuro | Videojuegos, apps de recompensas, esports | Tríada o compuesta | 15.2 · 11.2 · `#000000` 12.7 |

## Belleza

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Rosa empolvado** (claro) | Polvo `#FBF1EF` | Ciruela `#4A2E35` | Frambuesa `#C2185B` | Delicadeza, cuidado, cercanía | Maquillaje, cuidado de la piel, salones | Base neutra + acento | 10.9 · 5.3 · `#FFFFFF` 5.9 |
| **Malva** (claro) | Malva claro `#F4EFF6` | Uva `#3D2C4A` | Rosa intenso `#C0395A` | Sensibilidad, creatividad, calma | Bienestar femenino, fragancias, florerías | Análoga | 11.2 · 4.7 · `#FFFFFF` 5.3 |

## Inmobiliaria y construcción

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Concreto** (claro) | Cemento `#EEEDEA` | Acero `#2E3236` | Naranja obra `#C2510F` | Solidez, seguridad, avance | Constructoras, ferreterías, ingeniería | Base neutra + acento | 11.0 · 4.0 · `#FFFFFF` 4.7 |
| **Arquitectura** (oscuro) | Pizarra `#1C1F22` | Arena `#E7E2DA` | Madera clara `#C8A97E` | Diseño, calidez, inversión segura | Proyectos de vivienda, estudios de arquitectura, interiorismo | Base neutra + acento | 12.8 · 7.4 · `#000000` 9.4 |

## Periodismo y denuncia

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Titular** (claro) | Papel prensa `#FAFAF7` | Negro `#121212` | Rojo alerta `#D7261E` | Urgencia, verdad, autoridad | Noticias, denuncias, piezas de opinión | Base neutra + acento | 17.9 · 4.8 · `#FFFFFF` 5.0 |
| **Investigación** (oscuro) | Noche `#101418` | Hueso `#E8E6E1` | Amarillo evidencia `#F2C14E` | Seriedad, revelación, tensión | Reportajes, documentales, hilos de investigación | Base neutra + acento | 14.8 · 11.0 · `#000000` 12.5 |

## Deportes

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Energía** (oscuro) | Negro `#0B0B0B` | Blanco hielo `#F5F5F5` | Naranja fuego `#FF5A1F` | Fuerza, velocidad, competencia | Gimnasios, ropa deportiva, torneos | Base neutra + acento | 18.1 · 6.3 · `#000000` 6.7 |
| **Cancha** (claro) | Cal `#F3F6F2` | Verde cancha `#12372A` | Azul camiseta `#2563EB` | Equipo, aire libre, confianza | Clubes, escuelas deportivas, apuestas responsables | Tríada o compuesta | 12.0 · 4.7 · `#FFFFFF` 5.2 |

## Café y artesanal

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Tostado** (claro) | Pergamino `#F5EFE6` | Café tostado `#3E2C23` | Arcilla `#B5502E` | Calidez, oficio, origen | Cafeterías, panaderías, productos artesanales | Base neutra + acento | 11.6 · 4.4 · `#FFFFFF` 5.1 |

## Música y eventos

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Noche de concierto** (oscuro) | Púrpura noche `#120B1F` | Lila claro `#F1E9FF` | Rosa fuego `#FF4D6D` | Emoción, euforia, noche | Conciertos, festivales, lanzamientos musicales | Base neutra + acento | 16.3 · 6.0 · `#000000` 6.5 |

## Producto premium

| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Kronos H1** (claro) · fuente: @go.expoose | Gris Porcelana `#E4E3DE` | Taupe Seta `#8B7E71` | Ultra Violeta `#6B2BFF` | Ingeniería, precisión, valor | Vista explotada o despiece técnico de un producto | Base neutra + acento | 3.1 · 4.8 · `#FFFFFF` 6.1 (el 30 sirve para superficies y texto grande) |
| **Vortex T1** (oscuro) · fuente: @go.expoose | Noche Berenjena `#2B1D2F` | Crema Almendra `#E8DCC6` | Verde Voltio `#B6F500` | Rendimiento, energía contenida | Bento grid de especificaciones y métricas | Base neutra + acento | 11.7 · 12.2 · `#000000` 16.0 |
| **Lumina M1** (color) · fuente: @go.expoose | Azul Klein `#0033B0` | Blanco Tiza `#EEEDE8` | Naranja Papaya `#FF7B2C` | Impacto, confianza, energía | Hero de una landing, primer impacto | Tríada o compuesta | 8.5 · 3.9 · `#000000` 8.1 |
