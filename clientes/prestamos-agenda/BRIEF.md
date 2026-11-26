# Brief — App de cobros, recordatorios y agenda (clienta, 1 iPhone)

Fase actual: 1–2 (preguntas). Archivo: `preguntas.html` (20 de opción múltiple + 10 abiertas).

## Proceso pedido por Cristóbal para esta app
1. 20 preguntas de opción múltiple → 2. 10 preguntas abiertas → 3. formato interactivo de diseño
→ 4. boceto en el celular de la clienta → 5. aprobación y código completo.

## Condiciones fijas
- iPhone · PWA instalada desde Safari · 1 sola usuaria.
- Notificaciones (iOS 16.4+ y app instalada; a hora fija necesita servidor de Web Push).
- Agenda diaria, semanal y mensual.
- Interfaz parecida a las apps de préstamos anteriores (base: `clientes/oro-prestamos/app`).
- Reporte de préstamos.

## Decisiones de Cristóbal (fase 1–2)
- Avisos: servidor gratis (Cloudflare, cuenta nueva de NEXO PC) → llegan con la app cerrada.
- Datos: solo en el iPhone + respaldo manual (exportar/importar). Recordatorio de respaldo dentro de la app.
- Bloqueo: Face ID + PIN. Modo prueba con datos de ejemplo: sí.
- Base: app de oro (toda la mecánica de préstamos: calendario de colores, botón +, préstamo en 3 pasos, cierre del día).
- Pestañas: Inicio · Agenda · (+) · Préstamos · Reportes. Reportes en pantalla + PDF.
- Extras: recibo de pago por WhatsApp, foto del cliente/cédula (solo en el iPhone).
- iPhone 18 Pro Max (iOS reciente → push OK).
- Asistente de inicio lo llenan juntos al instalar. Préstamos del cuaderno los pasa ella.
- Entrega en persona. Precio: $500.000, sin mensualidad, todo al entregar. Plazo: 1 semana.

## Asistente de inicio (lo responde la clienta dentro de la app)
Negocio (nombre/logo) · Préstamos (tipo, interés, frecuencia, días, mora, abonos) · Medios de pago
· Avisos (cuáles, hora, tono WhatsApp) · Agenda (vista inicial, qué anota) · Datos del cliente.

## Diseño (fase 3)
- Tema sigue al iPhone (claro de día / oscuro de noche), dorado. Letra normal. Ícono: inicial dorada sobre negro.
- **Lo principal es la agenda y los recordatorios.** Inicio = agenda del día en tarjetas por tipo (Cobros · Citas · Tareas · Entregas).
- Semana: fila por día con etiquetas de color. Mes: puntos por tipo; tocar un día muestra sus tarjetas.
- Reporte: dona capital vs interés (día/semana/mes) + PDF.
- Botón +: Prestar (azul) · Cobrar (turquesa) · Recordatorio y Cita (rosa).
- Cliente: solo número de cédula, sin foto. Recibo de pago por WhatsApp.
- Boceto: `boceto.html` (fase 4).
- Íconos premium: duotono (relleno suave + trazo fino) sobre fichas con degradado; ícono de la app = monograma dorado dentro de un aro moneda/reloj (versión oscura y clara).
- **Cita rápida en 3 toques** (la clienta trabaja en oficina): Qué (12 plantillas: Reunión, Llamada, Cliente, Informe, Almuerzo, Médico, Banco, Pagar, Cumpleaños, Cobro, Recordar, Otro) → Cuándo (botones de día y hora, "en 1 hora") → Guardar. Aviso 15 min antes por defecto.
  "Las de siempre": las más usadas salen arriba y se crean con 1 toque. Nota opcional (dictado del teclado del iPhone).
- Cada evento muestra el ícono de su plantilla en Inicio, Semana y Mes.

## App 1.0.0 (fase 5) — terminada
- `app/index.html` (toda la app), `app/sw.js` (sin internet + avisos push), `app/manifest.webmanifest`, `app/icons/`.
- Se arma con `python3 src/armar.py`: junta el código nuevo (`src/p1–p4.js`, `src/head.html`) con la parte de préstamos de `clientes/oro-prestamos/app/index.html` (cálculos, prestar, cobrar, corregir cuota con candado, cuaderno, ficha del cliente, PIN/Face ID). **Editar en `src/` y volver a armar**, no `app/index.html` a mano.
- Publica en `docs/cobros/` con `python3 build.py`.
- Inicio = su día (tarjetas Cobros · Citas · Tareas · Entregas, toque = filtro) + Cita rápida + Cobrar + Por hora + Atrasados.
- Agenda Día/Semana/Mes. Eventos (`k:'ev'`): tipo (12 plantillas + entrega), fecha, hora, aviso (min), rep (no/lab/sem/mes/ano), hechos{fecha}, skip{fecha}.
- Cita rápida: favoritas automáticas (se repiten 2+ veces), horas según su horario, "En 1 hora", Todo el día, otra fecha/hora, Deshacer.
- Préstamo con "Hora de entrega" opcional → crea evento Entrega en la agenda.
- Reportes: dona capital/interés/faltó (día/semana/mes), plata en la calle, atrasados, mejores pagadores, PDF. Cierre del día con conteo de efectivo.
- Avisos: `avisos-worker/` (Cloudflare Worker + KV + cron cada minuto, Web Push cifrado). La app manda los avisos de 21 días cada vez que cambia algo. Pasos en `AVISOS.md`. Pruebas: `node avisos-worker/prueba.mjs`.
- Ícono: ✓ dorado por defecto; antes de instalar se puede escoger la letra (Safari toma el ícono dibujado al agregar a inicio).
- Datos: localStorage `cobros-agenda-v1` (solo en el iPhone) + copia semanal recordada en Inicio. Entrega: `ENTREGA.md`.
- Pendiente: probar avisos en un iPhone real con el Worker publicado.

## Servidor de avisos (montado)
- Cuenta Cloudflare de NEXO PC. Worker `avisos-cobros` → https://avisos-cobros.nexopc2.workers.dev · KV `AVISOS` (id 1b6c2d6677fb4419bcc7965c1cfb3d26) · cron cada minuto.
- Variables: VAPID_PUBLIC, VAPID_PRIVATE_JWK (secreto), VAPID_SUBJECT. La privada solo vive en Cloudflare.
- `PUSH_URL` y `PUSH_KEY` ya están en `src/p1.js`.
