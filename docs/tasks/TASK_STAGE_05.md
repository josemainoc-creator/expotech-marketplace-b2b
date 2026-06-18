[TASK_STAGE_05.md](https://github.com/user-attachments/files/29098345/TASK_STAGE_05.md)
# TASK_STAGE_05.md
# Expotech Marketplace B2B — Etapa 5
## Carrito, solicitud de pedido, Order y OrderItems

## Alcance
Implementar solo:
- Carrito B2B.
- Validación de mínimos de compra.
- Validación contra stock disponible.
- Solicitud de pedido.
- Creación de Order.
- Creación de OrderItems.
- Página de confirmación `/pedido-confirmado`.
- Historial comprador `/mis-pedidos`.
- Detalle comprador `/mis-pedidos/[id]`.
- Vista admin básica `/admin/pedidos`.
- Vista cliente básica `/cliente/pedidos`.
- Cambio de estado de pedido por admin y cliente autorizado.
- ActivityLog básico asociado a pedidos.

No implementar:
- Pago online.
- Checkout pagado.
- Facturación electrónica.
- Integración ERP.
- Integración logística.
- Emails completos.
- Métricas avanzadas.
- Comisiones.
- Despacho automatizado.

## Regla crítica
Todo pedido es una solicitud comercial B2B, no una venta confirmada.

Texto obligatorio:
“Este pedido no constituye una venta final confirmada. El stock, precio, condiciones de pago y despacho serán validados por el equipo comercial antes de su confirmación.”

## Contexto
Ya existen:
- usuarios y roles
- campañas
- compradores aprobados/rechazados
- productos
- categorías
- importación CSV
- catálogo privado
- detalle producto
- permisos para ocultar precios a compradores no aprobados

Ahora se debe permitir que compradores aprobados armen una solicitud de pedido.

## Roles
- SUPER_ADMIN_EXPOTECH: ve todos los pedidos, cambia estados y agrega notas.
- CLIENT_ADMIN: ve solo pedidos de sus campañas, cambia estado y agrega notas.
- BUYER approved: crea pedidos y ve solo sus propios pedidos.
- BUYER pending/rejected/inactive: no puede crear pedidos.
- Usuario no autenticado: no puede crear pedidos.

## Modelos involucrados
Usar o completar:
- Order
- OrderItem
- Product
- Campaign
- Company
- User
- BuyerProfile
- ActivityLog

## Order
Campos mínimos:
- id
- campaignId
- buyerCompanyId
- buyerUserId
- status
- subtotal
- notes
- paymentConditionRequested
- deliveryMethodRequested
- adminNotes
- createdAt
- updatedAt

Estados:
- draft
- submitted
- under_review
- approved
- rejected
- fulfilled
- cancelled

Regla:
Al enviar solicitud, el pedido queda en `submitted`.

## OrderItem
Campos mínimos:
- id
- orderId
- productId
- sku
- productName
- quantity
- unitPrice
- lineTotal
- createdAt

Reglas:
- Guardar snapshot de SKU, nombre y precio.
- Validar quantity contra minOrderQty.
- Validar quantity contra availableStock.
- No permitir quantity <= 0.
- No permitir productos inactive.
- No permitir sold_out.
- Calcular lineTotal = quantity * unitPrice.
- Calcular subtotal del Order como suma de líneas.
- Backend recalcula precios y totales. No confiar en frontend.

## Carrito
Ruta:
- `/carrito`

Debe permitir:
- Ver productos agregados.
- Cambiar cantidades.
- Eliminar productos.
- Ver subtotal por línea.
- Ver subtotal total.
- Ingresar notas.
- Elegir condición de pago solicitada:
  - transferencia
  - factura crédito
  - por coordinar
- Elegir forma de entrega solicitada:
  - retiro
  - despacho
  - por coordinar
- Enviar solicitud de pedido.

No implementar pago.

## Agregar producto al carrito
Desde catálogo o detalle:
- Botón “Agregar al pedido”.
- Selector de cantidad.
- Respetar minOrderQty.
- Respetar availableStock.
- Bloquear sold_out.
- Si usuario no aprobado, redirigir a `/mi-cuenta`.
- Si usuario no autenticado, redirigir a login.

Persistencia:
- Puede ser base de datos, session storage o estado usuario.
- Priorizar simplicidad y robustez.
- Asociar carrito a usuario comprador y campaña.
- No mezclar productos de campañas distintas en el mismo pedido.

## Confirmación
Ruta:
- `/pedido-confirmado`

Mostrar:
- ID pedido.
- Campaña.
- Monto solicitado.
- Estado `submitted`.
- Mensaje de validación comercial.
- Link a `/mis-pedidos`.

Mensaje:
“Hemos recibido tu solicitud de pedido. El equipo comercial validará stock, condiciones de pago y despacho antes de confirmar la venta.”

## Historial comprador
Ruta:
- `/mis-pedidos`

Mostrar solo pedidos del comprador autenticado:
- ID pedido.
- Campaña.
- Fecha.
- Estado.
- Total.
- Ver detalle.

Ruta:
- `/mis-pedidos/[id]`

Mostrar:
- datos generales
- productos
- cantidades
- precios
- subtotales
- notas comprador
- condición de pago solicitada
- entrega solicitada
- estado
- mensaje de validación

BUYER no puede ver pedidos ajenos.

## Admin pedidos
Rutas:
- `/admin/pedidos`
- `/admin/pedidos/[id]`

SUPER_ADMIN_EXPOTECH puede:
- ver todos los pedidos
- filtrar por campaña
- filtrar por estado
- buscar por empresa, RUT, contacto o ID
- ver detalle
- cambiar estado
- agregar nota interna
- cancelar pedido
- exportar CSV básico si ya existe infraestructura

## Cliente pedidos
Rutas:
- `/cliente/pedidos`
- `/cliente/pedidos/[id]`

CLIENT_ADMIN puede:
- ver solo pedidos de campañas de su empresa
- cambiar estado
- agregar nota interna
- exportar si existe infraestructura

CLIENT_ADMIN no puede ver pedidos ajenos.

## Cambios de estado
Estados permitidos:
- submitted
- under_review
- approved
- rejected
- fulfilled
- cancelled

Reglas:
- BUYER no cambia estado.
- SUPER_ADMIN_EXPOTECH puede cambiar cualquier pedido.
- CLIENT_ADMIN cambia solo pedidos propios.
- Al cambiar estado, registrar ActivityLog.
- Si se rechaza, permitir motivo en adminNotes.
- No descontar stock definitivamente en esta etapa salvo lógica segura existente.
- Mostrar “Stock informado sujeto a confirmación”.

## Seguridad
Implementar o reforzar:
- requireAuth()
- requireRole()
- assertBuyerApproved()
- canAccessCampaign()
- canViewProduct()
- canCreateOrder()
- canViewOrder()
- canManageOrder()

Reglas:
- Usuario no autenticado no crea pedidos.
- BUYER no aprobado no crea pedidos.
- BUYER no ve pedidos ajenos.
- CLIENT_ADMIN no ve pedidos de otros clientes.
- SUPER_ADMIN_EXPOTECH ve todo.
- No confiar en precios enviados desde frontend.
- Validar todo con Zod.

## ActivityLog
Registrar:
- cart_item_added
- cart_item_updated
- cart_item_removed
- order_submitted
- order_status_changed
- order_cancelled
- buyer_order_viewed
- admin_order_viewed

## Textos obligatorios
Carrito:
“Los productos agregados corresponden a una solicitud de pedido mayorista sujeta a validación.”

Confirmación:
“Hemos recibido tu solicitud de pedido. El equipo comercial validará stock, condiciones de pago y despacho antes de confirmar la venta.”

Detalle pedido:
“Este pedido no constituye una venta final confirmada. El stock, precio, condiciones de pago y despacho serán validados por el equipo comercial antes de su confirmación.”

## Seed demo
Agregar si corresponde:
- 3 pedidos demo:
  - submitted
  - under_review
  - approved
- Cada pedido con 2 a 5 OrderItems.
- Compradores distintos.
- Campaña “Venta Privada Mayorista Motherna”.

## Criterios de aceptación
1. BUYER approved puede agregar productos al carrito.
2. BUYER pending/rejected/inactive no puede agregar productos.
3. Usuario no autenticado no puede agregar productos.
4. Carrito valida mínimo de compra.
5. Carrito valida stock disponible.
6. Pedido se crea como submitted.
7. OrderItems guardan snapshot.
8. Backend recalcula totales.
9. `/pedido-confirmado` funciona.
10. BUYER ve sus pedidos en `/mis-pedidos`.
11. BUYER no ve pedidos ajenos.
12. SUPER_ADMIN_EXPOTECH ve todos los pedidos.
13. CLIENT_ADMIN ve solo pedidos propios.
14. Admin o cliente autorizado cambia estado.
15. ActivityLog registra eventos.
16. No se implementó pago, facturación, ERP ni logística.

## Entrega esperada
Reportar:
- archivos creados/modificados
- comandos ejecutados
- migraciones realizadas
- cómo probar comprador aprobado
- cómo probar comprador no aprobado
- cómo probar mínimos
- cómo probar stock
- cómo probar creación de pedido
- cómo probar panel admin pedidos
- cómo probar panel cliente pedidos
- pendientes para Etapa 6
