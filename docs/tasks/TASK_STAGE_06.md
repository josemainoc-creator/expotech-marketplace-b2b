# TASK_STAGE_06.md
# Expotech Marketplace B2B — Etapa 6
## Emails transaccionales, exportaciones y reporte operativo simple

## Alcance
Implementar solo:
- Emails transaccionales básicos.
- Aviso a comprador cuando envía solicitud de pedido.
- Aviso interno a Expotech cuando entra un pedido.
- Aviso al CLIENT_ADMIN/mandante cuando entra un pedido de su campaña.
- Aviso al comprador cuando cambia estado del pedido.
- Registro de envíos en EmailLog.
- Exportación CSV/XLSX de pedidos.
- Exportación CSV/XLSX de items de pedido.
- Exportación CSV/XLSX de compradores.
- Reporte operativo simple por campaña.
- Refuerzo de ActivityLog vinculado a pedidos, estados y exportaciones.

No implementar:
- Pago online.
- Checkout pagado.
- Facturación electrónica.
- Integración ERP.
- Integración logística.
- Automatización de despacho.
- Métricas avanzadas tipo BI.
- Integraciones externas complejas.
- Marketing automation masivo.

## Regla crítica
Los emails y reportes deben reforzar que el pedido es una solicitud B2B sujeta a validación.

Texto obligatorio:
“Este pedido no constituye una venta final confirmada. El stock, precio, condiciones de pago y despacho serán validados por el equipo comercial antes de su confirmación.”

## Contexto
Ya existen:
- roles
- campañas
- compradores aprobados/rechazados
- productos y categorías
- catálogo privado
- carrito
- solicitud de pedido
- Order y OrderItems
- historial comprador
- admin pedidos
- cliente pedidos
- cambios de estado

Ahora se debe volver operable el flujo comercial con notificaciones, exportaciones y reportes simples.

## Roles
- SUPER_ADMIN_EXPOTECH: ve todo, exporta todo y recibe avisos internos.
- CLIENT_ADMIN: ve/exporta pedidos de sus campañas y recibe avisos de pedidos propios.
- BUYER approved: recibe confirmación de solicitud y cambios de estado.
- BUYER no aprobado: no participa de pedidos.

## Modelos involucrados
Usar o completar:
- EmailLog
- ActivityLog
- Order
- OrderItem
- Campaign
- Company
- User
- BuyerProfile
- Product

## EmailLog
Campos mínimos:
- id
- campaignId
- orderId si aplica
- recipientEmail
- subject
- templateName
- status
- providerMessageId
- errorMessage
- sentAt
- openedAt si no existe tracking real puede quedar null
- clickedAt si no existe tracking real puede quedar null
- metadata
- createdAt

Estados EmailLog.status:
- pending
- sent
- failed
- skipped

Reglas:
- Registrar todo intento de envío.
- Si falla el email, no bloquear el flujo principal.
- Guardar errorMessage si falla.
- No exponer errores técnicos al usuario final.

## Proveedor email
Usar Resend si ya está configurado.
Si no está configurado:
- Crear capa abstraída en `lib/email`.
- Permitir modo mock/dev.
- No bloquear la app por falta de RESEND_API_KEY.
- Documentar variables de entorno.

Variables sugeridas:
- RESEND_API_KEY
- EMAIL_FROM
- INTERNAL_SALES_EMAIL
- APP_BASE_URL

## Templates requeridos

### 1. Pedido recibido — comprador
Disparador:
- Order creado en estado submitted.

Destinatario:
- buyerUser.email

Asunto:
“Solicitud de pedido recibida - Expotech Marketplace B2B”

Contenido:
- nombre comprador
- ID pedido
- campaña
- subtotal solicitado
- resumen corto de items
- link a `/mis-pedidos/[id]`
- texto de validación comercial obligatorio

### 2. Nuevo pedido — Expotech
Disparador:
- Order creado en estado submitted.

Destinatario:
- INTERNAL_SALES_EMAIL o admin configurado.

Asunto:
“Nuevo pedido recibido en Expotech Marketplace B2B”

Contenido:
- ID pedido
- campaña
- empresa compradora
- contacto
- email
- teléfono
- subtotal
- link a `/admin/pedidos/[id]`

### 3. Nuevo pedido — mandante
Disparador:
- Order creado en estado submitted.

Destinatario:
- usuarios CLIENT_ADMIN asociados a la empresa mandante de la campaña.

Asunto:
“Nuevo pedido para revisión - [Nombre campaña]”

Contenido:
- ID pedido
- empresa compradora
- subtotal
- resumen de items
- link a `/cliente/pedidos/[id]`
- texto de validación comercial

### 4. Estado de pedido actualizado — comprador
Disparador:
- cambio de estado de Order.

Destinatario:
- buyerUser.email

Asunto:
“Actualización de tu solicitud de pedido”

Contenido:
- ID pedido
- campaña
- estado nuevo
- comentario si existe
- link a `/mis-pedidos/[id]`
- texto de validación si no está fulfilled

### 5. Pedido aprobado — comprador
Puede ser template separado o variante del anterior.

Disparador:
- status = approved

Contenido:
- indicar que el pedido fue aprobado comercialmente
- aclarar que pago, factura y despacho serán coordinados según condiciones del mandante
- no prometer despacho automático

### 6. Pedido rechazado/cancelado — comprador
Disparador:
- status = rejected o cancelled

Contenido:
- informar actualización
- mostrar motivo si existe en adminNotes
- tono profesional y breve

## Funciones recomendadas
Crear en `lib/email`:
- sendEmail()
- logEmailAttempt()
- sendOrderSubmittedBuyerEmail()
- sendOrderSubmittedInternalEmail()
- sendOrderSubmittedClientEmail()
- sendOrderStatusChangedBuyerEmail()

Todas deben:
- recibir datos ya validados
- registrar EmailLog
- no lanzar errores que rompan el flujo principal
- retornar resultado success/failure

## Disparadores
Integrar emails en:
- submitOrderAction
- acción de cambio de estado de pedido admin
- acción de cambio de estado de pedido cliente

Regla:
Si el email falla, la orden o cambio de estado debe quedar igualmente guardado.

## Exportaciones

### Exportar pedidos
Disponible para:
- SUPER_ADMIN_EXPOTECH: todos o filtrados.
- CLIENT_ADMIN: solo campañas propias.

Formato:
- CSV mínimo.
- XLSX si ya existe librería disponible o se puede agregar sin complejidad.

Columnas:
- orderId
- estado
- fecha
- campaña
- empresa compradora
- RUT comprador
- contacto
- email
- teléfono
- región
- comuna
- subtotal
- condición pago solicitada
- forma entrega solicitada
- notas comprador
- notas internas

### Exportar items
Columnas:
- orderId
- campaña
- empresa compradora
- SKU
- producto
- marca si existe
- categoría si existe
- cantidad
- precio unitario
- total línea

### Exportar compradores
Disponible para admin.
Columnas:
- empresa
- RUT
- tipo comercio
- contacto
- email
- teléfono
- región
- comuna
- estado aprobación
- fecha registro
- campaña asociada si existe
- prioridad si existe
- último contacto si existe
- próximo seguimiento si existe

## Rutas sugeridas
Admin:
- `/admin/pedidos/export`
- `/admin/pedidos/export-items`
- `/admin/compradores/export`
- `/admin/reportes`

Cliente:
- `/cliente/pedidos/export`
- `/cliente/reportes`

Si la arquitectura usa server actions, mantener consistencia.

## Reporte operativo simple

### Admin `/admin/reportes`
Debe mostrar:
- total pedidos recibidos
- monto total solicitado
- ticket promedio solicitado
- pedidos por estado
- top 10 compradores por monto
- top 10 productos por monto
- top 10 productos por unidades
- campañas activas con pedidos
- pedidos recientes

Filtros:
- campaña
- fecha desde/hasta
- estado

### Cliente `/cliente/reportes`
Debe mostrar solo campañas propias:
- total pedidos recibidos
- monto solicitado
- pedidos por estado
- top productos
- top compradores
- pedidos recientes

No implementar BI complejo ni gráficos avanzados obligatorios.
Puede ser cards + tablas.

## Seguridad
Reglas:
- SUPER_ADMIN_EXPOTECH exporta todo.
- CLIENT_ADMIN exporta solo pedidos/campañas propias.
- BUYER no accede a exportaciones admin/cliente.
- BUYER no accede a reportes admin/cliente.
- No exponer pedidos ajenos en exports.
- Recalcular permisos en backend, no confiar en frontend.
- Validar filtros con Zod.

Helpers si hacen falta:
- canExportOrders()
- canViewReports()
- canSendOrderEmail()
- canAccessOrder()

## ActivityLog
Registrar:
- order_email_buyer_sent
- order_email_buyer_failed
- order_email_internal_sent
- order_email_internal_failed
- order_email_client_sent
- order_email_client_failed
- order_exported
- order_items_exported
- buyers_exported
- report_viewed
- order_status_email_sent
- order_status_email_failed

## UI
Usar Tailwind + shadcn/ui.
Diseño:
- B2B
- sobrio
- operacional
- tablas claras
- botones de exportación visibles
- filtros simples
- no sobrecargar

## Seed/demo
Si corresponde:
- agregar EmailLog demo
- asegurar pedidos demo para reportes
- asegurar diferentes estados de pedido

## Criterios de aceptación
1. Al crear pedido submitted, se intenta enviar email al comprador.
2. Al crear pedido submitted, se intenta enviar aviso interno Expotech.
3. Al crear pedido submitted, se intenta avisar al CLIENT_ADMIN del mandante.
4. Si falla un email, el pedido igual queda creado.
5. EmailLog registra sent o failed.
6. Al cambiar estado, se intenta avisar al comprador.
7. Admin puede exportar pedidos.
8. Admin puede exportar items.
9. Admin puede exportar compradores.
10. CLIENT_ADMIN solo exporta pedidos de sus campañas.
11. BUYER no accede a exportaciones ni reportes admin/cliente.
12. Admin ve reporte operativo simple.
13. CLIENT_ADMIN ve reporte propio.
14. ActivityLog registra exportaciones, reportes y emails.
15. No se implementó pago, facturación, ERP ni logística.

## Entrega esperada
Reportar:
- archivos creados/modificados
- comandos ejecutados
- variables de entorno nuevas
- migraciones realizadas
- cómo probar email comprador
- cómo probar email interno
- cómo probar email mandante
- cómo probar falla de email sin romper pedido
- cómo probar exportación admin
- cómo probar exportación cliente
- cómo probar reportes
- pendientes para Etapa 7
