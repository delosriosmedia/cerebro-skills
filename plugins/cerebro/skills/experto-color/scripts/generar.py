#!/usr/bin/env python3
"""Genera references/paletas.md y galeria.html desde scripts/paletas.json.

Uso: python3 scripts/generar.py
Cada paleta nueva se agrega en paletas.json y se corre este script; los
contrastes y la armonía se calculan solos.
"""
import html
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from medir_color import contraste, hex_a_rgb, lch, dist_tono, rgb_a_hex  # noqa: E402


def armonia(c60, c30, c10):
    L6, C6, h6 = lch(c60)
    L3, C3, h3 = lch(c30)
    L1, C1, h1 = lch(c10)
    base = None
    if C3 >= 15:
        base = h3
    elif C6 >= 15:
        base = h6
    if base is None:
        return 'Base neutra + acento'
    d = dist_tono(base, h1)
    if d < 25:
        return 'Monocromática'
    if d < 70:
        return 'Análoga'
    if d > 140:
        return 'Complementaria'
    return 'Tríada o compuesta'


def texto_sobre(c10, c60, c30):
    op = [hex_a_rgb('#FFFFFF'), hex_a_rgb('#000000'), c60, c30]
    mejor = max(op, key=lambda t: contraste(t, c10))
    return rgb_a_hex(mejor), contraste(mejor, c10)


def main():
    paletas = json.load(open(os.path.join(AQUI, 'paletas.json'), encoding='utf-8'))
    filas = []
    for p in paletas:
        (n6, h6), (n3, h3), (n1, h1) = p['colores']
        c6, c3, c1 = hex_a_rgb(h6), hex_a_rgb(h3), hex_a_rgb(h1)
        t_hex, t_cr = texto_sobre(c1, c6, c3)
        p['_c'] = {
            '30/60': contraste(c6, c3), '10/60': contraste(c6, c1),
            'texto10': (t_hex, t_cr), 'armonia': armonia(c6, c3, c1)}
        filas.append(p)

    # ---------- paletas.md ----------
    md = ['# Biblioteca de paletas 60-30-10', '',
          'Archivo generado por `scripts/generar.py` desde `scripts/paletas.json`. Para sumar una paleta, se edita el JSON y se corre el script.', '',
          'Cada paleta trae tres colores con su rol: el 60 es el fondo o lienzo, el 30 lleva tarjetas, bloques y texto, y el 10 es el acento para el llamado a la acción o el dato clave. Los contrastes se miden con la fórmula de WCAG: el 30 sobre el 60 debe llegar a 4,5 si lleva texto, y el 10 sobre el 60 a 3 como mínimo.', '',
          '**Cómo elegir:** filtra por sector y por emoción, luego por modo (claro u oscuro). Si la marca ya tiene un color, búscalo como 10 o como 60 y conserva la estructura de la paleta cambiando ese tono por el de la marca; vuelve a medir con `medir_color.py --hex`.', '']
    sectores = []
    for p in filas:
        if p['sector'] not in sectores:
            sectores.append(p['sector'])
    for s in sectores:
        md += [f'## {s}', '', '| Paleta | 60 | 30 | 10 | Emoción | Uso | Armonía | Contraste 30/60 · 10/60 · texto sobre el 10 |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
        for p in [x for x in filas if x['sector'] == s]:
            (n6, h6), (n3, h3), (n1, h1) = p['colores']
            c = p['_c']
            aviso = '' if c['30/60'] >= 4.5 else ' (el 30 sirve para superficies y texto grande)'
            fuente = f" · fuente: @{p['fuente']}" if p.get('fuente') else ''
            md.append(f"| **{p['nombre']}** ({p['modo']}){fuente} | {n6} `{h6}` | {n3} `{h3}` | {n1} `{h1}` | {p['emocion']} | {p['uso']} | {c['armonia']} | {c['30/60']:.1f} · {c['10/60']:.1f} · `{c['texto10'][0]}` {c['texto10'][1]:.1f}{aviso} |")
        md.append('')
    open(os.path.join(RAIZ, 'references', 'paletas.md'), 'w', encoding='utf-8').write('\n'.join(md))

    # ---------- galeria.html ----------
    tarjetas = []
    for p in filas:
        (n6, h6), (n3, h3), (n1, h1) = p['colores']
        c = p['_c']
        t10 = c['texto10'][0]
        tarjetas.append(f'''<article class="pal" data-sector="{html.escape(p['sector'])}" data-modo="{p['modo']}">
  <div class="maq" style="background:{h6}">
    <div class="maq-barra" style="color:{h3}"><span class="logo" style="background:{h1}"></span><b>{html.escape(p['nombre'])}</b></div>
    <div class="maq-tit" style="color:{h3}">{html.escape(p['emocion'].split(',')[0])}</div>
    <div class="maq-tarjetas"><div style="background:{h3}"></div><div style="background:{h3}"></div></div>
    <div class="maq-btn" style="background:{h1};color:{t10}">Llamado a la acción</div>
  </div>
  <div class="barra"><i style="background:{h6};flex:60"></i><i style="background:{h3};flex:30"></i><i style="background:{h1};flex:10"></i></div>
  <div class="info">
    <h3>{html.escape(p['nombre'])} <small>{p['modo']}</small></h3>
    <p class="sec">{html.escape(p['sector'])} · {c['armonia']}</p>
    <ul>
      <li><span class="sw" style="background:{h6}"></span>60 · {html.escape(n6)} <code>{h6}</code></li>
      <li><span class="sw" style="background:{h3}"></span>30 · {html.escape(n3)} <code>{h3}</code></li>
      <li><span class="sw" style="background:{h1}"></span>10 · {html.escape(n1)} <code>{h1}</code></li>
    </ul>
    <p class="emo">{html.escape(p['emocion'])}. {html.escape(p['uso'])}.</p>
    <p class="cr">Contraste 30/60 {c['30/60']:.1f} · 10/60 {c['10/60']:.1f}</p>
  </div>
</article>''')
    botones = ''.join(f'<button data-f="{html.escape(s)}">{html.escape(s)}</button>' for s in sectores)
    pagina = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paletas 60-30-10</title>
<style>
:root{{--fondo:#F6F5F2;--tinta:#1A1A1A;--suave:#5F5E5A;--borde:#E2E0DA;--tarjeta:#FFFFFF}}
@media (prefers-color-scheme:dark){{:root{{--fondo:#141414;--tinta:#EDEDED;--suave:#A3A3A3;--borde:#2C2C2C;--tarjeta:#1E1E1E}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--fondo);color:var(--tinta);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}}
header{{padding:28px 16px 8px;max-width:1200px;margin:auto}}h1{{margin:0 0 6px;font-size:26px}}header p{{margin:0;color:var(--suave);max-width:70ch}}
nav{{display:flex;flex-wrap:wrap;gap:6px;padding:14px 16px;max-width:1200px;margin:auto}}
nav button{{border:1px solid var(--borde);background:var(--tarjeta);color:var(--tinta);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}}
nav button.on{{background:var(--tinta);color:var(--fondo)}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;padding:8px 16px 40px;max-width:1200px;margin:auto}}
.pal{{background:var(--tarjeta);border:1px solid var(--borde);border-radius:14px;overflow:hidden}}
.maq{{padding:14px;height:200px;justify-content:space-between;display:flex;flex-direction:column;gap:10px}}
.maq-barra{{display:flex;align-items:center;gap:8px;font-size:12px}}.logo{{width:14px;height:14px;border-radius:4px}}
.maq-tit{{font-size:20px;font-weight:700;line-height:1.1}}
.maq-tarjetas{{display:grid;grid-template-columns:1fr 1fr;gap:8px;height:46px}}.maq-tarjetas div{{border-radius:8px;opacity:.9}}
.maq-btn{{align-self:flex-start;font-size:12px;font-weight:600;padding:7px 12px;border-radius:999px}}
.barra{{display:flex;height:10px}}.barra i{{display:block}}
.info{{padding:12px 14px 14px}}h3{{margin:0;font-size:16px}}h3 small{{font-weight:400;color:var(--suave);font-size:12px}}
.sec,.cr{{margin:2px 0 8px;color:var(--suave);font-size:12px}}ul{{list-style:none;margin:0;padding:0;font-size:13px}}li{{display:flex;align-items:center;gap:8px;margin:3px 0}}
.sw{{width:16px;height:16px;border-radius:4px;border:1px solid var(--borde)}}code{{font-size:12px;color:var(--suave)}}.emo{{font-size:13px;margin:8px 0 4px}}
</style></head><body>
<header><h1>Paletas 60-30-10</h1><p>Biblioteca de la skill experto-color. Cada maqueta usa el 60 de fondo, el 30 en texto y tarjetas, y el 10 solo en el llamado a la acción. Filtra por sector.</p></header>
<nav><button class="on" data-f="*">Todas</button><button data-f="claro">Modo claro</button><button data-f="oscuro">Modo oscuro</button>{botones}</nav>
<main>{''.join(tarjetas)}</main>
<script>
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{{
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
  const f=b.dataset.f;
  document.querySelectorAll('.pal').forEach(p=>{{p.style.display=(f==='*'||p.dataset.sector===f||p.dataset.modo===f)?'':'none'}});
}});
</script></body></html>'''
    open(os.path.join(RAIZ, 'galeria.html'), 'w', encoding='utf-8').write(pagina)
    print(f'{len(filas)} paletas → references/paletas.md y galeria.html')


if __name__ == '__main__':
    main()
