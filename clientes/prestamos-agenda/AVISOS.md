# Montar el servidor de avisos (Cloudflare, gratis) — 20 minutos

Los avisos del iPhone (resumen de la mañana y 15 min antes de cada cita) necesitan un servidor pequeño que los mande
aunque la app esté cerrada. Se usa **Cloudflare Workers**, plan gratis (100.000 peticiones al día; esta app usa unas 3.000).

## 1. Crear las llaves (en tu PC)
1. Abre `avisos-worker/llaves.html` en Chrome → **Crear llaves**.
2. Guarda las dos llaves en un archivo de tu PC (no en GitHub).

## 2. Crear el Worker (en dash.cloudflare.com, con la cuenta de NEXO PC)
1. **Workers & Pages → Create → Create Worker** → nombre: `avisos-cobros` → **Deploy**.
2. **Edit code** → borra todo, pega el contenido de `avisos-worker/worker.js` → **Deploy**.
3. **Storage & Databases → KV → Create** → nombre: `AVISOS`.
4. En el Worker → **Settings → Bindings → Add → KV namespace** → Variable name: `AVISOS` → escoge el KV `AVISOS`.
5. **Settings → Variables and Secrets → Add**:
   - `VAPID_PUBLIC` (Text) → la clave pública.
   - `VAPID_PRIVATE_JWK` (Secret) → la clave privada.
   - `VAPID_SUBJECT` (Text) → `mailto:` + el correo de NEXO PC (Apple lo exige).
6. **Settings → Triggers → Cron Triggers → Add** → `* * * * *` (cada minuto).
7. Copia la dirección del Worker, algo como `https://avisos-cobros.TU-CUENTA.workers.dev`.
   Si la abres en el navegador debe decir `{"ok":true,...}`.

## 3. Conectar la app
En `app/index.html`, arriba del todo del código:
```js
const PUSH_URL='https://avisos-cobros.TU-CUENTA.workers.dev';
const PUSH_KEY='LA_CLAVE_PUBLICA';
```
Publica (`python3 build.py`). También se puede poner sin publicar: en la app → ⚙ Ajustes → Avisos → Configuración técnica.

## 4. Activar en el iPhone de la clienta
1. App instalada desde Safari (Compartir → Agregar a pantalla de inicio) y abierta desde el ícono.
2. ⚙ Ajustes → **Avisos → Activar avisos** → **Permitir**.
3. **Enviarme un aviso de prueba** → debe llegar en segundos.

## Qué guarda el servidor
Solo la suscripción del iPhone y el texto de los avisos de los próximos 21 días (ej. "En 15 min: Banco",
"5 cobros · 2 citas"). **No** guarda nombres de clientes, cédulas ni montos. Los préstamos siguen solo en el iPhone.

## Si deja de avisar
- La app vuelve a mandar la lista cada vez que se abre o se cambia algo. Si no la abre en 21 días, se acaban los avisos programados.
- Si ella borra la app o quita el permiso, hay que activarlos otra vez.
- Probar el Worker en local: `node avisos-worker/prueba.mjs` (7 pruebas, todas deben decir OK).
