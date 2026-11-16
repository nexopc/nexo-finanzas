# Brief — App de oro y préstamos (cliente hipotético)

Fase actual: 4 (código en `app/`, versión 1.0.0). Se publica en `docs/oro/` con `python3 build.py` → https://nexopc.github.io/nexo-finanzas/oro/

## Usuarios y dispositivos
- 2 socios, 1 iPhone cada uno (13 Pro Max y 17 Pro Max). Compatibilidad objetivo: iOS 16.4+.
- PWA instalada desde Safari. Bloqueo con PIN y Face ID (passkey/WebAuthn), alternados.

## Oro (función principal)
- Compra y venta por gramo. No solo puro: cada movimiento registra gramos y **ley/pureza** → gramos finos.
- Precio base = precio internacional (onza troy en USD → gramo → COP con la TRM), con opción manual.
- Inventario calculado (compras − ventas) + conteo físico para comparar "tengo vs debería tener".
- Valor del inventario a precio actual, costo promedio de compra, ganancia realizada y no realizada.
- Reportes: ventas (cuánto y a cuánto) y compras (cuánto y a cuánto) por día, semana y mes.

## Préstamos
- Unos 20 clientes, sin límite fijo (la app no debe fallar si son 5 o 500).
- Tipo de interés (diario, semanal, mensual; fijo o sobre saldo) → lo define el cliente (formulario).
- Sin garantía. Avisos de cuotas vencidas + mensaje sugerido por WhatsApp. Recibo en PDF.

## Inicio (para el boceto)
- Precio del gramo en COP · capital en oro (gramos y $) · costo de compra · ganancia.
- Cobros de hoy; si no hay, el próximo cobro. Atrasados aparte. Ambos con mensaje de WhatsApp sugerido.
- Recordatorios entre socios en una ventana flotante que se minimiza a un lado de la pantalla.

## Nube
- Sincronización en tiempo real entre los 2 celulares. Privada: solo ellos acceden.
- DECIDIDO: Firebase + acceso solo para 2 correos + **cifrado en el celular** (ni NEXO PC lee los datos) + código de recuperación impreso.

## Van al formulario del cliente
- Venta a crédito (sí/no), tipo de interés, métodos de pago, qué ver primero en Inicio,
  nombre/logo/colores, cómo fijan su precio de compra y venta frente al internacional.

## Decisiones de precio
- El % de compra/venta frente al internacional va en el formulario, pero **cambia según el día o el cliente**: cada movimiento permite editar el precio.

## Código
- Va en esta carpeta (`clientes/oro-prestamos/`), no en un repo aparte.

## Boceto v2 (decidido)
- Un color = una acción (color + ícono + verbo, siempre en el mismo lugar):
  dorado comprar oro · verde vender oro · azul prestar · turquesa cobrar · morado enviar (WhatsApp/recibo/PDF)
  · rosa recordatorio · rojo gasto/atraso · gris ver/editar · naranja solo para "vence hoy".
- Tomado de "Tus Finanzas" (boceto de prestamista): préstamo en 3 pasos que se llena solo (sin domingos ni festivos),
  calendario de colores por cliente, cobrar varias cuotas o abono, cliente que venía del cuaderno, cierre del día
  (capital vs. interés), capital total. No se toma la ruta con mapa.
- Pestañas: Inicio · Oro · (+) · Préstamos · Caja. Botón + con 6 acciones.
- **Modo prueba** con datos de ejemplo y sin nube para que Cristóbal la pruebe en su iPhone antes de entregar.
- Guía de primera vez (4 botones) + video corto en Filmora.

## Comercial
- Precio sugerido: $2.000.000 desarrollo (50/50) + $100.000/mes.
- Plazo: 2 semanas. Todo dato del negocio se llena dentro de la app (nada en el repositorio).

## App 1.0.0 (fase 4)
- `app/index.html` (toda la app), `app/sw.js` (sin internet), `app/manifest.webmanifest`, `app/icons/`.
- El cuestionario va dentro de la app como asistente de inicio (6 pasos) y se puede editar en ⚙ → Ajustes del negocio.
- Botón "Probar con datos de ejemplo" (PIN 1234). ⚙ → Empezar de cero lo borra.
- Nube: Firebase + cifrado AES-256 en el celular. Pasos en `FIREBASE.md`. Pendiente probar con un proyecto real.
- Pendiente / no incluido: avisos push a una hora fija (iPhone necesita servidor), aprobación de borrados por el otro socio
  (hoy solo se le avisa), venta de oro a crédito.
