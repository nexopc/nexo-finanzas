# Cómo se publica cada actualización de NEXO Finanzas

## Quién es el usuario
Cristóbal (NEXO PC). Sueldo quincenal **en efectivo**, que a veces llega tarde.
Cuentas: Efectivo, Nequi, ARQ (dólares y euros). Celular: Samsung Galaxy A25 (Chrome). También usa PC con Windows.
Metas: Diciembre, NEXO PC y Equipo de contenido. Los montos reales viven solo en su celular, nunca en este repositorio.
Español de Colombia, directo, con datos reales.

## Cómo llega una idea nueva
1. Cristóbal escribe la idea en la app (Más → Actualizar la app e ideas nuevas) y la copia al chat con Claude.
2. Claude edita `app.html` (y `sw-template.js` si toca el modo sin internet o las alertas).
3. Claude sube la versión en `version.json` (`version` + una entrada nueva al inicio de `notas`).
4. `python3 build.py` → regenera `docs/` (cambia la versión dentro de `docs/sw.js`, eso dispara el botón "Actualizar").
5. Commit y push a `main`. En minutos la app de Cristóbal muestra "Hay una versión nueva → Actualizar".

## Reglas
- **Nunca borrar ni renombrar datos guardados.** Si un dato cambia de forma, agrega la conversión en `migrate()`.
- Versiones: 1.0.0 → 1.0.1 (arreglo), 1.1.0 (función nueva), 2.0.0 (cambio grande).
- Registrar un movimiento debe seguir tomando 10 segundos o menos y sin escribir.
- Probar en 412×915 (tamaño del A25), modo claro y oscuro, antes de publicar.
- Tasas: Coinbase (varias veces por hora) y open.er-api.com de respaldo. Las alertas comparan con el promedio de 7 días (±1,5 %).
