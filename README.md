# NEXO Finanzas

App personal de finanzas de Cristóbal (NEXO PC — "Excelencia digital, confianza real").
Es una PWA: se instala desde Chrome en Android y desde Chrome/Edge en Windows, y funciona sin internet.

- App publicada: carpeta `docs/` (GitHub Pages → rama `main`, carpeta `/docs`).
- Fuente: `app.html` (toda la app), `sw-template.js` (modo sin internet, actualizaciones y alertas del dólar),
  `manifest.webmanifest`, `icons/`, `version.json` (versión y novedades).
- Armar la versión publicable: `python3 build.py` → regenera `docs/`.

Los datos de Cristóbal **no** están en este repositorio: viven solo en su celular (localStorage).
