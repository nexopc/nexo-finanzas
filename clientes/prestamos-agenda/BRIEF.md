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
