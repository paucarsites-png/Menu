# Bitácora de trabajo — 1 de agosto de 2026

Proyecto: **Smash Point — Menú**

## Conversación resumida

- Se convirtieron las tarjetas de producto en tarjetas expandibles al tocarlas.
- Se reemplazaron los emojis de las tarjetas por imágenes de referencia de los productos.
- Las imágenes crecen cuando una tarjeta se expande; actualmente usan un tamaño responsive entre **118 px y 144 px**.
- Batidos y Colas P tienen selectores desplegables:
  - Batidos: Chocolate, Fresa, Oreo y Durazno.
  - Colas P: Sprite, Coca-Cola, Fanta e Inca.
  - Cada opción usa controles de cantidad `− / cantidad / +` después de agregarse.
- Al reducir a cero la cantidad de un producto, su tarjeta vuelve al estado compacto. En bebidas, también se cierra el selector.
- Se amplió la tipografía secundaria de las tarjetas para mejorar la lectura.
- Se agregó una capa responsive para móviles pequeños, tablets y escritorio.
- El cajón del carrito muestra **Subtotal, IVA (15%) y Total**.
- El mensaje de WhatsApp muestra solo comprador, fecha, productos y **precio total**. No incluye ID, subtotal ni IVA.

## Organización actual de archivos

- `smash_point_menu.html`: estructura de la página y orden de carga de scripts.
- `smash_point_menu.css`: estilos, tarjetas expandibles y reglas responsive.
- `smash_point_products.js`: catálogo del menú; contiene productos, precios, imágenes y opciones.
- `smash_point_menu.js`: interfaz, carrito, cantidades, selector de bebidas y cajón del carrito.
- `smash_point_whatsapp.js`: creación y envío del pedido a WhatsApp.

## Orden de scripts requerido

En `smash_point_menu.html` deben cargarse en este orden:

1. `smash_point_products.js`
2. `smash_point_menu.js`
3. `smash_point_whatsapp.js`

No cambiar este orden sin revisar las dependencias entre archivos.

## Nota para continuar

El número de WhatsApp está en `smash_point_whatsapp.js` bajo la constante `WHATSAPP_NUMBER`.

