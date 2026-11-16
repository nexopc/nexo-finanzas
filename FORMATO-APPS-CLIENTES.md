# Formato NEXO PC para crear apps de clientes

Proceso fijo que Cristóbal (NEXO PC) usa con Claude para cada app nueva de un cliente.
Para usarlo en otro chat: pega este archivo o di "usa mi formato de apps de clientes".

## Las 4 fases (siempre en este orden)

| # | Fase | Qué entrega Claude | Quién responde |
|---|------|--------------------|----------------|
| 1 | Preguntas a Cristóbal | ~20 preguntas clave agrupadas por tema | Cristóbal |
| 2 | Boceto | Maqueta visual de las pantallas (HTML que se ve en el celular) | Cristóbal la revisa |
| 3 | Cuestionario al cliente | Preguntas concretas, cortas, para mandar por WhatsApp o hacer en persona | El cliente |
| 4 | Código | App terminada + instrucciones para instalarla en el celular del cliente | Cristóbal la entrega |

No se salta ninguna fase. Si falta una respuesta importante, Claude lo dice antes de seguir.

## Fase 1 — temas que siempre se preguntan
1. Negocio: qué vende/hace, cuál es la función principal de la app.
2. Usuarios: quién la usa (dueño, empleados), cuántos celulares.
3. Dispositivo: **iPhone por defecto** (modelo y versión de iOS).
4. Datos: qué se registra, qué cálculos hace, qué reportes quiere ver.
5. Dinero: moneda, métodos de pago, intereses, precios que cambian.
6. Privacidad: datos solo en el celular o en la nube; respaldo.
7. Diseño: colores, logo, nombre de la app.
8. Comercial: cuánto cobra Cristóbal, plazo, mantenimiento mensual.

## Reglas técnicas por defecto (iPhone primero)
- Formato: **PWA** (una página web que se instala con Safari → Compartir → "Agregar a pantalla de inicio").
  No requiere App Store ni cuenta de Apple Developer (USD 99/año).
- Probar en 390×844 (iPhone 12–15) y 375×667 (iPhone SE), modo claro y oscuro.
- Respetar el notch y la barra de abajo (`env(safe-area-inset-*)`), botones de mínimo 44 px.
- Inputs con letra de 16 px o más (si no, Safari hace zoom solo).
- Teclado numérico para montos (`inputmode="decimal"`).
- Funciona sin internet (service worker).
- Safari puede borrar los datos de una web que no se abre en 7 días si **no** está instalada:
  la app siempre se instala en la pantalla de inicio y trae botón de **respaldo (exportar/importar)**.
- Notificaciones push en iPhone solo con iOS 16.4+ y la app instalada.
- Nunca borrar ni renombrar datos guardados; si cambian, migrarlos.
- Montos en pesos colombianos con formato `$ 1.250.000`.
- Datos reales del cliente nunca se suben al repositorio.

## Lo que aprendimos con la app de oro y préstamos
- El cuestionario de la fase 3 también va **dentro de la app** como asistente de inicio, y se puede editar después en Ajustes.
- Siempre incluir **"Probar con datos de ejemplo"** para que Cristóbal la pruebe en su iPhone antes de entregarla.
- **Un color = una acción** (color + ícono + verbo, siempre en el mismo lugar), para que se use de memoria.
- Publicar para pruebas en `docs/<carpeta>` (GitHub Pages) con `build.py` y pedir permiso antes de subir a main.

## Entrega al cliente
- Enlace de la app + video corto (Filmora) mostrando cómo instalarla y usarla.
- Versión y novedades en `version.json`.
- Precio de mantenimiento mensual acordado por escrito.
