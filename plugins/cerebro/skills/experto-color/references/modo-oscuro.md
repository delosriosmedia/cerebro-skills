# Color en modo oscuro

Reglas para llevar una paleta 60-30-10 a una interfaz o pieza oscura. El modo oscuro es un tema diseñado aparte: se reasignan los roles y se vuelve a medir cada par.

## Reglas

| Regla | Cómo se aplica | Por qué |
| --- | --- | --- |
| Fondo casi negro | El 60 va en un casi negro con un leve matiz (por ejemplo `#18181B` o un marino muy oscuro). El negro puro queda para fondos de foto, video o temas OLED | El negro puro con blanco puro cansa la vista y en pantallas OLED deja estela al desplazar |
| Acento menos saturado | Baja la saturación del 10 entre 20 y 30 % frente a su versión clara; el tono y la luminosidad se mantienen | Un acento al 100 % de saturación vibra sobre fondo oscuro y se vuelve molesto de mirar |
| Capas más claras al subir | Cada superficie que está «encima» (tarjeta, menú, modal) es más clara que la de abajo. Parte del fondo y suma de 8 a 10 puntos de luminosidad por nivel; dos o tres niveles alcanzan | La luz imaginada viene de arriba: lo más cercano recibe más luz. Una capa superior más oscura que el fondo se lee como un error y cuesta procesarla |
| Texto blanco suavizado | Texto principal al 90–93 % de blanco; secundario cerca del 60 %, medido sobre su superficie real | El blanco pleno sobre casi negro deslumbra |
| Grises con matiz | El tinte de los grises con el tono del acento lo decide `impeccable` (decisión de Angel) | Se mantiene una sola regla en un solo lugar |

## Cómo queda el 60-30-10 en oscuro

- **60:** fondo casi negro y sus capas elevadas (cuentan como el mismo color: son variantes de luminosidad).
- **30:** texto claro y superficies de contraste (tarjetas claras sobre fondo oscuro, como en la paleta Vortex T1).
- **10:** el acento, desaturado 20–30 %, en tres elementos por pantalla como máximo.

Ejemplos de la biblioteca en modo oscuro: Terminal lima, Cian frío, Oro sobrio, Noir dorado, Investigación, Vortex T1 ([paletas.md](paletas.md)).

## Relación con otras skills

`design-engineering` (skills-angel) trae los valores de tokens para el modo oscuro (`references/surface/dark-mode.md`): escalas reasignadas, anillos y bordes. Esta guía coincide con ella en el fondo casi negro, el acento desaturado 20–30 % y las capas más claras al subir.

## Fuentes

- [Dark Mode UI Essentials, parte 1](https://hype4.academy/articles/design/dark-mode-ui-essentials-part-1), hype4.academy.
- [60/30/10 Colors in UI Design](https://hype4.academy/articles/design/60-30-10-rule-in-ui), hype4.academy.
