# Tus Finanzas

App de Android para quien presta plata (hecha para Juan Gabriel, en Quibdó).
Clientes, préstamos por cuotas, cobros, ruta del día con minimapa, gastos, reportes y consejos.
**Funciona sin internet.** Los datos viven solo en el celular (más la copia que se guarde en Drive).

- Instalador: [`TusFinanzas.apk`](TusFinanzas.apk) (Android 7 o superior; probado para Samsung).
- Versión: ver `version.json`.

![Pantallas de Tus Finanzas](capturas.png)

## Un color = una acción

| Color | Significa |
|---|---|
| Verde | Entra plata: cobrar, ingresos, cuotas pagadas |
| Rojo | Sale plata o hay problema: gastos, atrasados, mora |
| Amarillo | Toca hoy |
| Azul | Crear algo nuevo |
| Morado | Enviar: WhatsApp, recibo, PDF, copia de seguridad |
| Gris | Ver o editar |

## Qué hace

- **Ruta de hoy** (pantalla principal): quién toca cobrar hoy y quién está atrasado, ordenados por el horario de
  atención de cada cliente y por cercanía. Minimapa con los puntos numerados y la ruta.
- **Mapa sin internet**: en Ajustes se descargan una vez (con wifi) las calles de Quibdó desde OpenStreetMap.
  Se puede cambiar a *En línea* (abre Google Maps para guiar calle por calle) o *Apagado* (solo lista).
- **Préstamos**: monto, interés en pesos, número de cuotas, frecuencia (diario, semanal, quincenal, mensual,
  trimestral, semestral), mora en % de la cuota y fechas fijas sin domingos ni festivos de Colombia
  (cada fecha se puede cambiar). Opción "Ya venía del cuaderno" para pasar los préstamos que ya existían.
- **Cobrar** en 2 toques, recibo como imagen por WhatsApp, recordatorio por WhatsApp, deshacer un cobro.
- **Resumen**: capital total (prestado en la calle + plata en mano), ganancia frente al 1 del mes,
  consejo de cuánto volver a prestar y cuánto gastar, y gráfica de intereses (potencial, lo que debería llevar y lo real).
- **Gastos fijos e ingresos** con categorías propias.
- **Reportes** del día, semana, mes y año, y descarga en PDF.
- **Aviso diario** a la hora que se elija: "Hoy tienes 7 cobros por $410.000 · 2 atrasados".
- **Copia de seguridad** a Google Drive y restauración.

## Cómo está hecha

- `web/`: la app (HTML, CSS y JavaScript, sin librerías externas).
  - `js/util.js` plata, fechas y festivos · `js/datos.js` préstamos, capital, reportes y ruta ·
    `js/mapa.js` minimapa · `js/docs.js` recibo PNG y PDF · `js/app.js` pantallas.
- `android/`: el "envase" Android (WebView) con GPS, avisos, compartir archivos y descarga del mapa.
- `build_apk.sh`: arma y firma el APK sin Android Studio (descarga sus herramientas de Maven Central).

### Probar en el computador

```bash
cd tus-finanzas/web && python3 -m http.server 8765
```

Abrir `http://localhost:8765/?hoy=2026-11-09&hora=07:30` (los parámetros `hoy` y `hora` sirven para pruebas).

### Sacar una versión nueva

1. Cambiar `version` y subir `code` en `version.json` (el `code` siempre debe ser mayor que el anterior).
2. Poner la llave de firma en `../.llave/tusfinanzas.p12` y correr:

```bash
TF_STOREPASS="$(cat ../.llave/clave.txt)" ./build_apk.sh
```

3. Instalar el APK nuevo **encima** del anterior: los datos se conservan.

> **La llave de firma (`tusfinanzas.p12` y su clave) NO está en este repositorio.** Guárdala en un lugar seguro.
> Sin ella, una versión nueva no se puede instalar encima y habría que desinstalar (se pierden los datos
> que no estén en una copia de seguridad).

Datos del mapa © colaboradores de OpenStreetMap (licencia ODbL).
