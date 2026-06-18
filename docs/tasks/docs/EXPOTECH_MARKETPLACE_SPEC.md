# Expotech Marketplace B2B
## Especificación funcional y técnica para Codex

## 1. Resumen ejecutivo

Construir una aplicación web llamada **Expotech Marketplace B2B**.

No es un ecommerce abierto al consumidor final. Es una plataforma privada por invitación para ventas especiales mayoristas, orientada a liquidar stock detenido de marcas, importadores, distribuidores o laboratorios.

Expotech no opera cajas físicas, no monta módulos, no provee guardias y no administra físicamente la mercadería. Su rol es desarrollar comercialmente la venta: prospectar compradores, convocar, ordenar la oferta, producir detalles comerciales y habilitar una plataforma privada de pedidos online.

La aplicación debe permitir que compradores B2B —farmacias independientes, pañaleras, minimarkets, perfumerías, distribuidores regionales, tiendas de barrio y mayoristas secundarios— puedan revisar productos, ver precios mayoristas, mínimos de compra, stock disponible y enviar solicitudes de pedido online.

El mandante valida stock, factura, cobra y despacha. La aplicación genera pedidos comerciales, no ventas pagadas automáticamente.

## 2. Objetivo del MVP

Crear una aplicación web funcional, rápida, segura y escalable que permita:
1. Crear y administrar ventas privadas por campaña.
2. Cargar productos de liquidación.
3. Invitar compradores B2B.
4. Aprobar o rechazar compradores.
5. Mostrar catálogo privado solo a compradores autorizados.
6. Permitir búsqueda, filtros y navegación de productos.
7. Permitir carrito o solicitud de pedido.
8. Recibir pedidos sujetos a validación.
9. Exportar compradores, productos y pedidos.
10. Medir actividad comercial básica.

## 3. Stack técnico recomendado

- Framework: Next.js 14+ con App Router.
- Lenguaje: TypeScript.
- UI: Tailwind CSS + shadcn/ui.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Autenticación: NextAuth/Auth.js.
- Validaciones: Zod.
- Emails transaccionales: Resend.
- Imágenes: Cloudinary, Supabase Storage o S3 compatible.
- Exportaciones: CSV y XLSX.
- Deploy objetivo: Vercel.
- Variables de entorno mediante `.env`.

## 4. Roles

### SUPER_ADMIN_EXPOTECH
Usuario interno de Expotech. Puede crear campañas, crear mandantes, cargar productos, invitar compradores, aprobar compradores, ver todos los pedidos, exportar información, ver métricas globales y administrar usuarios.

### CLIENT_ADMIN
Usuario del mandante o dueño del stock. Puede ver solo sus campañas, productos y pedidos; cambiar estado de pedidos y exportar pedidos de sus campañas. No puede ver campañas de otros clientes ni modificar configuración global.

### BUYER
Comprador B2B. Puede registrarse o ingresar mediante invitación, completar perfil empresa, ver campañas autorizadas, ver catálogo privado, agregar productos al pedido, enviar solicitud de pedido y ver historial propio. No puede ver productos ni precios sin autorización.

## 5. Estados

### Campaña
- draft
- active
- paused
- closed
- archived

### Comprador
- pending
- approved
- rejected
- inactive

### Invitación
- created
- sent
- opened
- registered
- expired
- cancelled

### Pedido
- draft
- submitted
- under_review
- approved
- rejected
- fulfilled
- cancelled

## 6. Reglas de negocio

1. No mostrar productos ni precios a usuarios no aprobados.
2. No permitir pedidos si la campaña está cerrada.
3. No permitir pedidos bajo el mínimo de compra.
4. No permitir cantidades mayores al stock disponible.
5. Todo pedido entra como `submitted`.
6. Ningún pedido se considera venta confirmada hasta aprobación del mandante o administrador.
7. El pedido debe mostrar: “Sujeto a validación de stock y condiciones comerciales”.
8. Los compradores solo ven sus propios pedidos.
9. El cliente/mandante solo ve sus propias campañas.
10. Expotech puede ver todo.
11. El stock visible es referencial y sujeto a confirmación.
12. No implementar pago online en el MVP.

## 7. Modelo de datos requerido

### User
- id
- name
- email
- phone
- passwordHash
- role
- companyId
- status
- createdAt
- updatedAt

### Company
- id
- name
- rut
- businessType
- contactName
- email
- phone
- region
- comuna
- address
- website
- status
- createdAt
- updatedAt

### BuyerProfile
- id
- userId
- companyId
- businessType
- monthlyPurchaseEstimate
- categoriesOfInterest
- approvalStatus
- approvedAt
- rejectedReason
- createdAt
- updatedAt

### ClientProfile
- id
- companyId
- commercialContactName
- commercialContactEmail
- commercialContactPhone
- billingContactName
- billingContactEmail
- createdAt
- updatedAt

### Campaign
- id
- slug
- name
- clientCompanyId
- description
- shortDescription
- startDate
- endDate
- status
- accessType
- termsAndConditions
- minimumOrderAmount
- heroImageUrl
- createdAt
- updatedAt

### ProductCategory
- id
- campaignId
- name
- slug
- description
- sortOrder
- createdAt
- updatedAt

### Product
- id
- campaignId
- categoryId
- sku
- name
- brand
- description
- regularPrice
- liquidationPrice
- wholesalePrice
- minOrderQty
- unitType
- unitsPerBox
- availableStock
- expirationDate
- status
- featured
- imageUrl
- createdAt
- updatedAt

### ProductImage
- id
- productId
- url
- altText
- sortOrder
- createdAt

### Order
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

### OrderItem
- id
- orderId
- productId
- sku
- productName
- quantity
- unitPrice
- lineTotal
- createdAt

### Invitation
- id
- campaignId
- email
- companyName
- contactName
- phone
- token
- status
- expiresAt
- openedAt
- registeredAt
- createdAt

### ActivityLog
- id
- userId
- campaignId
- action
- entityType
- entityId
- metadata
- createdAt

### EmailLog
- id
- campaignId
- recipientEmail
- subject
- templateName
- status
- providerMessageId
- sentAt
- openedAt
- clickedAt
- metadata

### LeadStatus
- id
- campaignId
- companyId
- status
- priority
- source
- lastContactAt
- nextFollowUpAt
- notes
- createdAt
- updatedAt

## 8. Rutas requeridas

### Públicas / autenticación
- `/login`
- `/registro`
- `/solicitar-acceso`
- `/invitacion/[token]`
- `/campana/[slug]`

### Comprador
- `/catalogo`
- `/producto/[id]`
- `/carrito`
- `/pedido-confirmado`
- `/mis-pedidos`
- `/mis-pedidos/[id]`

### Admin Expotech
- `/admin`
- `/admin/campanas`
- `/admin/campanas/nueva`
- `/admin/campanas/[id]`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/importar`
- `/admin/compradores`
- `/admin/pedidos`
- `/admin/pedidos/[id]`
- `/admin/invitaciones`
- `/admin/metricas`

### Cliente / Mandante
- `/cliente`
- `/cliente/pedidos`
- `/cliente/pedidos/[id]`
- `/cliente/productos`
- `/cliente/metricas`

## 9. Funcionalidades por módulo

### Landing privada de campaña
Ruta: `/campana/[slug]`

Mostrar logo/nombre Expotech, nombre campaña, descripción corta, fecha de inicio y término, categorías principales, texto “Venta privada mayorista por invitación”, botones “Solicitar acceso” e “Ingresar con invitación”, y mensaje “Los precios y productos están disponibles solo para compradores aprobados”.

No mostrar precios, stock, catálogo completo ni datos sensibles del mandante.

### Registro comprador B2B
Campos obligatorios:
- Nombre empresa
- RUT
- Giro o tipo de negocio
- Tipo de comercio
- Nombre contacto
- Email
- Teléfono
- Región
- Comuna
- Dirección
- Volumen estimado de compra
- Categorías de interés
- Aceptación de términos

Reglas: validar con Zod, evitar emails duplicados, crear Company, crear User BUYER, crear BuyerProfile pending, aplicar token de invitación si existe y mostrar mensaje de solicitud recibida.

### Invitaciones
Crear invitaciones desde admin, token único, fecha expiración, ruta `/invitacion/[token]`, precargar datos existentes, marcar opened al visitar y registered al completar registro.

### Catálogo privado
Ruta: `/catalogo`. Solo compradores aprobados y usuarios autorizados.

Debe incluir lista de productos activos, filtro por categoría, marca, rango de precio, disponibilidad, vencimiento próximo, buscador por SKU/nombre/marca y orden por más reciente, menor precio, mayor descuento, mayor stock y nombre.

Tarjeta producto: imagen, nombre, marca, SKU, categoría, precio mayorista, precio lista tachado, porcentaje descuento, stock, mínimo de compra, unidad, botón agregar, estado agotado.

### Detalle producto
Ruta: `/producto/[id]`. Mostrar imagen principal, galería, datos comerciales, precios, ahorro, stock, unidad, mínimo, vencimiento, condiciones, selector cantidad y botón agregar. Mostrar advertencias de validación.

### Carrito / solicitud de pedido
Ruta: `/carrito`. Permitir ver productos, cambiar cantidades, eliminar, subtotales, notas, condición de pago solicitada y entrega solicitada. Al enviar, crear Order submitted, OrderItems, ActivityLog y mostrar `/pedido-confirmado`.

Mensaje: “Hemos recibido tu solicitud de pedido. El equipo comercial validará stock, condiciones de pago y despacho antes de confirmar la venta.”

### Historial comprador
Ruta: `/mis-pedidos`. Mostrar ID pedido, campaña, fecha, estado, total y detalle.

### Panel Super Admin Expotech
Dashboard con campañas activas, compradores registrados, compradores pendientes, pedidos, monto solicitado, top productos, top compradores y actividad reciente.

Debe permitir CRUD campañas, CRUD productos, importación CSV con preview, aprobar/rechazar compradores, gestionar invitaciones, cambiar estado de pedidos y exportar información.

### Panel Cliente / Mandante
Debe ver solo campañas, productos y pedidos propios. Puede cambiar estado de pedidos, agregar nota y exportar. No puede ver datos de otros mandantes.

## 10. Importación CSV de productos

Columnas requeridas:
sku,name,brand,category,description,regularPrice,wholesalePrice,minOrderQty,unitType,unitsPerBox,availableStock,expirationDate

Validar SKU, nombre, precio mayorista, stock y mínimo. Mostrar preview antes de importar.

## 11. Emails transaccionales

Usar Resend. Plantillas:
1. Invitación a venta privada.
2. Confirmación de solicitud de acceso.
3. Aprobación de comprador.
4. Rechazo de solicitud.
5. Pedido recibido.
6. Pedido aprobado.
7. Pedido rechazado o sin stock.
8. Aviso interno a Expotech.
9. Aviso al mandante.

Registrar envíos en EmailLog. Los errores de email no bloquean el flujo principal.

## 12. Métricas comerciales

Registrar ActivityLog para invitación creada/enviada/abierta, registro completado, comprador aprobado/rechazado, login comprador, producto visto, producto agregado/removido, pedido enviado/aprobado/rechazado y exportación.

Dashboard: invitaciones enviadas/abiertas, registrados, aprobados, compradores con pedido, conversión invitación > registro > pedido, monto solicitado, ticket promedio, top productos/categorías/compradores, pedidos por estado y evolución diaria.

## 13. Seguridad

Implementar middleware, control por rol, ownership, bloqueo de catálogo a no aprobados, tokens expirados, rate limiting básico, sanitización inputs, validación CSV, límite de archivo y manejo amigable de errores.

Helpers recomendados:
- requireAuth()
- requireRole()
- canAccessCampaign()
- canAccessOrder()
- assertBuyerApproved()

## 14. Textos comerciales estándar

General: “Expotech Marketplace B2B es una plataforma privada para ventas mayoristas de oportunidad. El acceso está limitado a compradores aprobados.”

Pedido: “Este pedido no constituye una venta final confirmada. El stock, precio, condiciones de pago y despacho serán validados por el equipo comercial antes de su confirmación.”

Catálogo: “Precios exclusivos para compradores mayoristas aprobados.”

Stock: “Stock informado sujeto a confirmación.”

Campaña cerrada: “Esta venta privada se encuentra cerrada. No es posible ingresar nuevos pedidos.”

## 15. Seed de datos

Crear Super Admin admin@expotech.cl, Mandante Demo Higiene y Bebés, campaña demo, categorías Bebés/Higiene personal/Cuidado familiar/Limpieza/Packs mayoristas, 25 productos ficticios, 8 compradores demo y 5 pedidos demo.

## 16. Testing básico

Tests para validación registro, validación producto, no permitir pedido bajo mínimo, no permitir cantidad mayor a stock, control por rol, comprador no aprobado no ve catálogo y cliente no ve campañas ajenas.

## 17. Deploy

README con instalación local, variables, Prisma migrate, Prisma seed, ejecución local, build, deploy Vercel, PostgreSQL, Resend y storage.

Variables:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- RESEND_API_KEY
- EMAIL_FROM
- STORAGE_PROVIDER
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- APP_BASE_URL

## 18. Restricciones del MVP

No construir pago online, facturación electrónica, ERP, logística automática, app móvil, marketplace abierto, multiidioma ni sistema complejo de comisiones.

Priorizar robustez, seguridad, simplicidad, velocidad comercial, claridad para compradores mayoristas y panel útil para Expotech.
