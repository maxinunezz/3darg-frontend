# Backlog — Optimización de conversión (CRO) en vista de producto

Ideas para maximizar el cierre de venta en `components/product-detail.tsx` (compartido por todas las marcas). Ninguna implementada todavía — quedan acá documentadas para retomar más adelante. Inspiradas en una captura de referencia de otro ecommerce que mostró el usuario (zona de compra con descuentos escalonados, badges de urgencia/confianza, etc.).

Al implementar cualquiera de estas, respetar el gotcha de `.site-lumy` documentado en `CLAUDE.md` (usar `mb-6!`/`mt-4!` para márgenes en `h1-h4`/`p` dentro de rutas Lumy).

## 1. Barra de descuento escalonado por cantidad
Mostrar debajo del precio algo tipo "Llevando 2 unidades: 10% OFF · Llevando 3+: 15% OFF", calculado en vivo según el `qty` del `AddToCartButton`. Requiere definir si el descuento es real (se aplica en el precio final/carrito) o solo informativo para derivar a Mayoristas. Si es real, hay que decidir dónde vive la regla: ¿campo nuevo en `ProductType`/backend, o tabla de reglas genérica por marca?

## 2. Prueba social (stats de confianza)
Línea corta arriba o debajo del botón de compra: "+X pedidos entregados" / "Entrega en Z días hábiles" / envío a todo el país. Necesita decidir la fuente del dato (¿hardcodeado por marca, o calculado real desde `orders`?). Si es hardcodeado, cuidado con que no sea un número falso que después haya que mantener a mano.

## 3. Badge de "últimas unidades" cuando el stock es bajo
Hoy el stock exacto se ocultó (ver commit que sacó "50 en stock"). Se podría reintroducir *solo* como urgencia cuando `product.stock` está por debajo de un umbral (ej. `<= 5`): "¡Últimas unidades!" en vez del número exacto. Definir el umbral y si aplica a todas las marcas o es configurable por `Brand`.

## 4. Layout con tabs (Descripción / Envío / Preguntas frecuentes)
En vez de todo el texto del producto en una sola columna larga, organizar en tabs. Cambio de UI más grande — tocaría la estructura general de `product-detail.tsx`, no solo la zona de compra. Evaluar si vale la pena dado el catálogo chico actual (pocos productos, descripciones cortas).

## 5. Reviews / calificaciones de producto
Mostrar estrellas y cantidad de reviews debajo del título. Requiere modelo de datos nuevo (no existe hoy `Review`/`Rating` en el backend) — es la idea de mayor esfuerzo de las 6, implica backend + moderación + UI.

## 6. Disclaimer "fabricado a pedido"
Línea de confianza/expectativa tipo "Este producto se fabrica a pedido — tiempo de producción de X días hábiles antes del envío". Baja fricción para implementar (solo copy + ícono), pero requiere confirmar el tiempo real de producción por marca/producto con el dueño antes de mostrar un número.

---

**Contexto de origen:** pedido del dueño en sesión del 2026-10-14, a partir de una captura de referencia de otro ecommerce, al mismo tiempo que se simplificó la zona de compra de `product-detail.tsx` a un grid 6/10 ("Agregar al carrito") + 4/10 ("Mayoristas").
