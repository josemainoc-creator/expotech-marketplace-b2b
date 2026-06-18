# Etapa 5 - Carrito y solicitudes de pedido

## Alcance construido

- Carrito local para compradores aprobados.
- Boton agregar desde catalogo y detalle de producto.
- Ruta `/carrito` con cantidades editables, eliminacion, subtotal, notas, condicion de pago solicitada y entrega solicitada.
- Validacion server-side de comprador aprobado.
- Validacion server-side de campaña activa.
- Validacion server-side de minimo por producto.
- Validacion server-side contra stock referencial.
- Validacion server-side de minimo de compra por campaña.
- Creacion de `Order` con estado `submitted`.
- Creacion de `OrderItems` con snapshot de SKU, nombre, cantidad, precio y total de linea.
- Ruta `/pedido-confirmado`.
- Historial comprador `/mis-pedidos` y detalle `/mis-pedidos/[id]`.
- Vistas basicas de pedidos para admin en `/admin/pedidos`.
- Vistas basicas de pedidos para cliente en `/cliente/pedidos`, filtradas por ownership.

## Fuera de alcance

- Pago.
- Checkout pagado.
- Facturacion.
- ERP.
- Logistica.
- Emails completos.
- Metricas avanzadas.
