#!/usr/bin/env python3
"""Mide los colores de una pieza y propone el reparto 60-30-10.

Uso:
  python3 medir_color.py pieza.png                 # mide una imagen o captura
  python3 medir_color.py pieza.png --recorte 0,0,1080,900   # mide solo una zona (x,y,ancho,alto)
  python3 medir_color.py --hex "#0E1116:55,#E6EDF3:25,#A3E635:8,#FF5A1F:7,#3B82F6:5"
  python3 medir_color.py --hex "#0E1116,#E6EDF3,#A3E635"   # sin áreas: solo roles y contraste
  python3 medir_color.py pieza.png --json          # salida para otros programas

Entrega: los colores agrupados con su área, el rol propuesto para cada uno
(60, 30, 10 o sobrante), qué hacer con los sobrantes, la distancia a la regla,
los contrastes clave y las paletas de la biblioteca más cercanas.
Requiere Pillow y numpy solo para imágenes.
"""
import argparse
import json
import math
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))

# ---------- color básico ----------

def hex_a_rgb(h):
    h = h.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_a_hex(rgb):
    return '#' + ''.join(f'{max(0, min(255, round(c))):02X}' for c in rgb)


def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminancia(rgb):
    r, g, b = (_lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a, b):
    la, lb = sorted([luminancia(a), luminancia(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def rgb_a_lab(rgb):
    r, g, b = (_lin(c) for c in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lch(rgb):
    L, a, b = rgb_a_lab(rgb)
    return L, math.hypot(a, b), (math.degrees(math.atan2(b, a)) + 360) % 360


def delta_e(a, b):
    return math.dist(rgb_a_lab(a), rgb_a_lab(b))


def dist_tono(h1, h2):
    d = abs(h1 - h2) % 360
    return min(d, 360 - d)


NOMBRES_TONO = [
    (12, 'rojo'), (40, 'naranja'), (65, 'amarillo'), (95, 'lima'), (150, 'verde'),
    (185, 'verde azulado'), (205, 'cian'), (240, 'azul'), (265, 'índigo'), (295, 'morado'),
    (335, 'rosa'), (361, 'rojo')]


def describir(rgb):
    import colorsys
    L, C, _ = lch(rgb)
    if C < 10:
        if L > 85:
            return 'neutro claro'
        if L < 25:
            return 'neutro oscuro'
        return 'gris'
    h = colorsys.rgb_to_hsv(*(c / 255 for c in rgb))[0] * 360
    base = next(n for tope, n in NOMBRES_TONO if h < tope)
    if L < 35:
        return f'{base} oscuro'
    if L > 80 and C < 35:
        return f'{base} pálido'
    return base

# ---------- medición de imagen ----------

def medir_imagen(ruta, recorte=None, k=10):
    try:
        from PIL import Image
        import numpy as np
    except ImportError:
        sys.exit('Falta Pillow o numpy: pip install pillow numpy')
    img = Image.open(ruta).convert('RGB')
    if recorte:
        x, y, w, h = recorte
        img = img.crop((x, y, x + w, y + h))
    img.thumbnail((360, 360))
    px = np.asarray(img, dtype=np.float64).reshape(-1, 3)
    rng = np.random.default_rng(7)
    if len(px) > 60000:
        px = px[rng.choice(len(px), 60000, replace=False)]
    # k-means++ simple en RGB lineal aproximado (suficiente para áreas de diseño plano)
    centros = [px[rng.integers(len(px))]]
    for _ in range(k - 1):
        d = np.min([((px - c) ** 2).sum(1) for c in centros], axis=0)
        if d.sum() == 0:
            break
        centros.append(px[rng.choice(len(px), p=d / d.sum())])
    centros = np.array(centros)
    for _ in range(25):
        asign = np.argmin(((px[:, None, :] - centros[None]) ** 2).sum(2), axis=1)
        nuevos = np.array([px[asign == i].mean(0) if (asign == i).any() else centros[i] for i in range(len(centros))])
        if np.allclose(nuevos, centros):
            break
        centros = nuevos
    total = len(px)
    grupos = [(tuple(centros[i]), float((asign == i).sum()) / total) for i in range(len(centros))]
    return agrupar(grupos)


def agrupar(grupos, umbral=12.0):
    """Une colores casi iguales (ΔE < umbral): cuentan como uno solo."""
    grupos = sorted([g for g in grupos if g[1] > 0.002], key=lambda g: -g[1])
    unidos = []
    for rgb, area in grupos:
        for u in unidos:
            if delta_e(u['rgb'], rgb) < umbral:
                t = u['area'] + area
                u['rgb'] = tuple((u['rgb'][i] * u['area'] + rgb[i] * area) / t for i in range(3))
                u['area'] = t
                break
        else:
            unidos.append({'rgb': rgb, 'area': area})
    return sorted(unidos, key=lambda u: -u['area'])

def familias(colores):
    """Une variantes claras y oscuras del mismo tono: cuentan como un solo color.
    Cromáticos: tono a menos de 20°. Neutros: luminosidad a menos de 15."""
    out = []
    for c in sorted(colores, key=lambda c: -(c['area'] or 0)):
        L, C, h = lch(c['rgb'])
        for f in out:
            Lf, Cf, hf = lch(f['rgb'])
            mismo = (C >= 8 and Cf >= 8 and dist_tono(h, hf) < 20) or (C < 8 and Cf < 8 and abs(L - Lf) < 15)
            if mismo:
                f.setdefault('variantes', []).append(c['rgb'])
                if c['area'] is not None and f['area'] is not None:
                    f['area'] += c['area']
                break
        else:
            out.append(dict(c))
    return out


# ---------- reparto ----------

def proponer(colores):
    """Asigna 60, 30, 10 y sobrantes. Cada color: {'rgb', 'area' (o None)}."""
    con_area = all(c['area'] is not None for c in colores)
    if con_area:
        orden = sorted(colores, key=lambda c: -c['area'])
    else:
        orden = list(colores)  # sin áreas: el orden dado manda (primero = dominante)
    dom = orden[0]
    resto = orden[1:]
    # El 10: el más saturado del resto que se lea sobre el dominante (≥ 3:1).
    def puntaje_acento(c):
        # Se queda el color vivo que ya trabaja como acento: el de más área entre
        # los legibles sobre el dominante; sin áreas, el más saturado.
        L, C, h = lch(c['rgb'])
        legible = contraste(c['rgb'], dom['rgb']) >= 3
        return (legible, c['area'] if con_area else C, C)
    candidatos = [c for c in resto if lch(c['rgb'])[1] >= 25]
    acento = max(candidatos, key=puntaje_acento) if candidatos else None
    resto2 = [c for c in resto if c is not acento]
    # El 30: el de más área entre los que contrastan con el dominante (3 o más).
    legibles = [c for c in resto2 if contraste(c['rgb'], dom['rgb']) >= 3]
    sec = (legibles or resto2 or [None])[0]
    if acento is None:
        otros = [c for c in resto2 if c is not sec]
        acento = otros[0] if otros else None
    sobrantes = [c for c in resto2 if c is not sec and c is not acento]
    roles = {'60': dom, '30': sec, '10': acento}
    # Qué hacer con cada sobrante
    for s in sobrantes:
        cerca = min((r for r in roles.items() if r[1]), key=lambda r: delta_e(r[1]['rgb'], s['rgb']))
        de = delta_e(cerca[1]['rgb'], s['rgb'])
        Ls, Cs, hs = lch(s['rgb'])
        if Cs < 10:
            cerca = min((r for r in roles.items() if r[1]), key=lambda r: abs(lch(r[1]['rgb'])[0] - Ls))
            s['rol_cercano'] = cerca[0]
            s['accion'] = f"Neutro de texto o detalle: iguálalo al {cerca[0]} ({rgb_a_hex(cerca[1]['rgb'])}) o a una variante clara u oscura de ese color"
            continue
        elif de < 30 or (Cs >= 10 and lch(cerca[1]['rgb'])[1] >= 10 and dist_tono(hs, lch(cerca[1]['rgb'])[2]) < 25):
            s['accion'] = f"Únelo al {cerca[0]} ({rgb_a_hex(cerca[1]['rgb'])}): es del mismo tono, cámbialo por ese color o por una variante clara u oscura"
        else:
            s['accion'] = f"Compite con el acento: quítalo, o si marca un estado (error, éxito) déjalo solo en ese estado con icono o texto"
        s['rol_cercano'] = cerca[0]
    return roles, sobrantes, con_area


def repartir_areas(roles, sobrantes):
    """Área de cada rol si los sobrantes se unen a su rol más cercano."""
    a = {k: (v['area'] if v else 0) for k, v in roles.items()}
    for s in sobrantes:
        a[s['rol_cercano']] += s['area']
    t = sum(a.values()) or 1
    return {k: v / t for k, v in a.items()}


OBJETIVO = {'60': (0.60, 0.50, 0.70), '30': (0.30, 0.20, 0.40), '10': (0.10, 0.05, 0.15)}


def veredicto(reparto):
    out = []
    for k, (meta, lo, hi) in OBJETIVO.items():
        v = reparto.get(k, 0)
        if v < lo:
            out.append(f"El {k} ocupa {v:.0%}: súbelo hacia {meta:.0%}")
        elif v > hi:
            out.append(f"El {k} ocupa {v:.0%}: bájalo hacia {meta:.0%}")
    return out


def cargar_paletas():
    with open(os.path.join(AQUI, 'paletas.json'), encoding='utf-8') as f:
        return json.load(f)


def paletas_cercanas(roles, n=3):
    dom = roles['60']['rgb']
    modo = 'claro' if lch(dom)[0] > 60 else 'oscuro'
    ac = roles['10']['rgb'] if roles['10'] else None
    puntuadas = []
    for p in cargar_paletas():
        c60, c30, c10 = (hex_a_rgb(x[1]) for x in p['colores'])
        d = delta_e(c60, dom) * 0.5
        if roles['30']:
            d += delta_e(c30, roles['30']['rgb']) * 0.3
        if ac:
            d += delta_e(c10, ac) * 0.8
        if (p['modo'] == 'claro') != (modo == 'claro'):
            d += 40
        puntuadas.append((d, p))
    return [p for _, p in sorted(puntuadas, key=lambda x: x[0])[:n]]


def informe(colores, salida_json=False):
    colores = familias(colores)
    roles, sobrantes, con_area = proponer(colores)
    datos = {
        'colores': [], 'roles': {}, 'sobrantes': [], 'reparto': None, 'ajustes': [], 'contrastes': {}, 'paletas_cercanas': []}
    for c in colores:
        L, C, h = lch(c['rgb'])
        datos['colores'].append({'hex': rgb_a_hex(c['rgb']), 'area': c['area'], 'tipo': describir(c['rgb']),
                                 'L': round(L), 'C': round(C), 'tono': round(h),
                                 'variantes': [rgb_a_hex(v) for v in c.get('variantes', [])]})
    for k, v in roles.items():
        datos['roles'][k] = rgb_a_hex(v['rgb']) if v else None
    for s in sobrantes:
        datos['sobrantes'].append({'hex': rgb_a_hex(s['rgb']), 'area': s['area'], 'accion': s['accion']})
    if con_area:
        rep = repartir_areas(roles, sobrantes)
        datos['reparto'] = rep
        datos['ajustes'] = veredicto(rep)
    d, s, a = roles['60'], roles['30'], roles['10']
    if s:
        datos['contrastes']['30 sobre 60'] = round(contraste(d['rgb'], s['rgb']), 2)
    if a:
        datos['contrastes']['10 sobre 60'] = round(contraste(d['rgb'], a['rgb']), 2)
        texto = max([(255, 255, 255), (0, 0, 0)] + [x['rgb'] for x in (d, s) if x], key=lambda t: contraste(t, a['rgb']))
        datos['contrastes']['mejor texto sobre el 10'] = f"{rgb_a_hex(texto)} ({contraste(texto, a['rgb']):.2f})"
    datos['paletas_cercanas'] = [{'id': p['id'], 'nombre': p['nombre'], 'colores': [x[1] for x in p['colores']]} for p in paletas_cercanas(roles)]
    if salida_json:
        print(json.dumps(datos, ensure_ascii=False, indent=2))
        return
    pr = print
    pr('## Colores medidos\n')
    pr('| Color | Área | Qué es | Rol propuesto | Variantes del mismo tono |')
    pr('| --- | --- | --- | --- | --- |')
    rol_de = {v: k for k, v in datos['roles'].items() if v}
    sob = {x['hex'] for x in datos['sobrantes']}
    for c in datos['colores']:
        area = f"{c['area']:.0%}" if c['area'] is not None else '—'
        rol = rol_de.get(c['hex'], 'sobrante' if c['hex'] in sob else '—')
        var = ' '.join(f'`{v}`' for v in c['variantes']) or '—'
        pr(f"| `{c['hex']}` | {area} | {c['tipo']} | {rol} | {var} |")
    if datos['sobrantes']:
        pr('\n## Qué hacer con los sobrantes\n')
        for x in datos['sobrantes']:
            pr(f"- `{x['hex']}`: {x['accion']}.")
    if datos['reparto']:
        r = datos['reparto']
        pr(f"\n## Reparto tras unir los sobrantes\n\n60: {r['60']:.0%} · 30: {r['30']:.0%} · 10: {r['10']:.0%}")
        if datos['ajustes']:
            for t in datos['ajustes']:
                pr(f'- {t}.')
        else:
            pr('- Cumple la regla (60 entre 50 y 70 %, 30 entre 20 y 40 %, 10 entre 5 y 15 %).')
    pr('\n## Contrastes\n')
    for k, v in datos['contrastes'].items():
        pr(f'- {k}: {v}')
    pr('- Mínimos: texto normal 4,5; texto grande y botones 3. El 10 debe leerse sobre el 60 (3 o más).')
    pr('\n## Paletas de la biblioteca más cercanas\n')
    for p in datos['paletas_cercanas']:
        pr(f"- **{p['nombre']}** (`{p['id']}`): {' · '.join(p['colores'])}")


def main():
    ap = argparse.ArgumentParser(description='Mide colores y propone el reparto 60-30-10')
    ap.add_argument('imagen', nargs='?')
    ap.add_argument('--hex', help='Lista "#RRGGBB[:área],..." en lugar de una imagen')
    ap.add_argument('--recorte', help='x,y,ancho,alto')
    ap.add_argument('--k', type=int, default=10, help='colores a buscar en la imagen (por defecto 10)')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()
    if a.hex:
        colores = []
        for parte in a.hex.split(','):
            parte = parte.strip()
            if not parte:
                continue
            if ':' in parte:
                h, ar = parte.split(':')
                colores.append({'rgb': hex_a_rgb(h), 'area': float(ar)})
            else:
                colores.append({'rgb': hex_a_rgb(parte), 'area': None})
        if all(c['area'] is not None for c in colores):
            t = sum(c['area'] for c in colores)
            for c in colores:
                c['area'] /= t
        else:
            for c in colores:
                c['area'] = None
    elif a.imagen:
        rec = tuple(int(x) for x in a.recorte.split(',')) if a.recorte else None
        colores = medir_imagen(a.imagen, rec, a.k)
    else:
        ap.error('Pasa una imagen o --hex')
    if len(colores) < 2:
        sys.exit('Hace falta al menos dos colores.')
    informe(colores, a.json)


if __name__ == '__main__':
    main()
