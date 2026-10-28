"""Arma la carpeta docs/ que se publica. Uso: python3 build.py
Fuente única: app.html (la app) y version.json (número de versión y novedades)."""
import json, re, shutil, pathlib
root = pathlib.Path(__file__).parent
ver = json.loads((root/'version.json').read_text())['version']
app = (root/'app.html').read_text()
app = re.sub(r"const APP_VERSION='[^']*';", f"const APP_VERSION='{ver}';", app)
(root/'app.html').write_text(app)
fx = app[app.index('/*FX-START*/'):app.index('/*FX-END*/')]
head = """<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content">
<meta name="theme-color" content="#110D17" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#F5F2F8" media="(prefers-color-scheme: light)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="NEXO $">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-180.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
</head>
<body>
"""
dist = root/'docs'
shutil.rmtree(dist, ignore_errors=True); dist.mkdir()
(dist/'index.html').write_text(head + app + "\n</body>\n</html>\n")
sw = (root/'sw-template.js').read_text().replace('__VERSION__', ver).replace('/*FX*/', fx)
(dist/'sw.js').write_text(sw)
for f in ['manifest.webmanifest', 'version.json', 'README.md', 'CONTEXTO.md']:
    if (root/f).exists(): shutil.copy(root/f, dist/f)
shutil.copytree(root/'icons', dist/'icons')
(dist/'.nojekyll').write_text('')
print('docs/ listo — versión', ver)
