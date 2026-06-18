# TASK_STAGE_04.md
# Expotech Marketplace B2B — Etapa 4
## Productos, categorías, importación y catálogo privado

## Alcance
Implementar solo:
- ProductCategory.
- Product.
- ProductImage si aplica.
- CRUD básico de productos para SUPER_ADMIN_EXPOTECH.
- Asociación de productos a Campaign.
- Asociación de productos a categorías.
- Importación CSV con preview y validación.
- Catálogo privado `/catalogo`.
- Detalle de producto `/producto/[id]`.
- Filtros, búsqueda y ordenamiento.
- Bloqueo de productos y precios para compradores no aprobados.
- Control de acceso por campaña y comprador aprobado.

No implementar:
- Carrito.
- Pedidos.
- Checkout.
- Pagos.
- Emails completos.
- Métricas avanzadas.
- ERP.
- Logística.
- Facturación.
- Panel comercial complejo.

## Regla crítica
Los productos y precios solo pueden ser vistos por:
- SUPER_ADMIN_EXPOTECH.
- CLIENT_ADMIN dueño de la campaña.
- BUYER aprobado y autorizado para la campaña.

Un BUYER pending, rejected o inactive no debe ver catálogo ni precios.

## Contexto
El proyecto es Expotech Marketplace B2B, plataforma privada para ventas mayoristas por invitación.

Ya existen:
- arquitectura base
- roles
- campañas
- empresas
- compradores
- solicitud de acceso
- invitaciones
- aprobación/rechazo
- LeadStatus
- ActivityLog
- `/mi-cuenta`

Ahora se debe construir el catálogo privado B2B para presentar productos en liquidación.

## Modelos involucrados
Usar o completar:
- Campaign
- ProductCategory
- Product
- ProductImage
- BuyerProfile
- Company
- User
- ActivityLog

## ProductCategory
Campos mínimos:
- id
- campaignId
- name
- slug
- description
- sortOrder
- createdAt
- updatedAt

Reglas:
- Una categoría pertenece a una campaña.
- El slug debe ser único dentro de la campaña.
- Permitir ordenar categorías.

## Product
Campos mínimos:
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

Estados Product.status:
- active
- inactive
- sold_out

unitType:
- unidad
- caja
- pack
- pallet
- display
- otro

Reglas:
- SKU obligatorio.
- Nombre obligatorio.
- Precio mayorista obligatorio.
- Stock obligatorio.
- Mínimo de compra obligatorio.
- Un producto pertenece a una campaña.
- Un producto puede pertenecer a una categoría.
- No mostrar productos inactive a compradores.
- Mostrar sold_out como agotado o bloquear acción futura.
- No permitir precios negativos.
- No permitir stock negativo.
- Calcular porcentaje de descuento cuando exista regularPrice.

## Admin productos
Crear o completar:
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/[id]`
- `/admin/productos/importar`

Tabla admin productos:
- SKU
- nombre
- marca
- campaña
- categoría
- precio mayorista
- stock
- mínimo
- estado
- destacado
- acciones

Filtros:
- campaña
- categoría
- marca
- estado
- destacado
- búsqueda por SKU, nombre o marca

Acciones:
- crear
- editar
- activar/inactivar
- marcar agotado
- destacar/no destacar
- ver detalle

Solo SUPER_ADMIN_EXPOTECH puede crear, editar o importar productos.

## Vista CLIENT_ADMIN productos
Crear o completar:
- `/cliente/productos`

CLIENT_ADMIN debe ver solo productos de campañas de su empresa.
Puede ver:
- SKU
- nombre
- marca
- categoría
- stock
- precio mayorista
- estado
- destacado

No permitir que CLIENT_ADMIN vea productos de otros mandantes.
Por defecto solo lectura.

## Importación CSV
Ruta:
- `/admin/productos/importar`

Debe permitir:
1. Seleccionar campaña.
2. Subir CSV.
3. Validar columnas.
4. Mostrar preview.
5. Mostrar errores antes de importar.
6. Importar productos válidos.

Columnas CSV:
- sku
- name
- brand
- category
- description
- regularPrice
- liquidationPrice
- wholesalePrice
- minOrderQty
- unitType
- unitsPerBox
- availableStock
- expirationDate
- featured
- imageUrl

Columnas obligatorias:
- sku
- name
- wholesalePrice
- minOrderQty
- availableStock

Validaciones:
- SKU no vacío.
- Nombre no vacío.
- wholesalePrice numérico y mayor o igual a cero.
- minOrderQty entero mayor a cero.
- availableStock entero mayor o igual a cero.
- expirationDate opcional con formato válido.
- Crear categoría si no existe dentro de la campaña.
- Bloquear o reportar duplicados por campaignId + sku.

## Catálogo privado
Ruta:
- `/catalogo`

Solo accesible a:
- BUYER aprobado
- SUPER_ADMIN_EXPOTECH
- CLIENT_ADMIN autorizado

Para BUYER:
- Debe tener BuyerProfile.approvalStatus = approved.
- Debe estar autorizado a la campaña correspondiente por invitación, LeadStatus o relación existente.
- Si no está aprobado, redirigir a `/mi-cuenta` o mostrar mensaje.

Debe mostrar:
- productos activos
- categorías
- filtros
- búsqueda
- ordenamiento

Filtros:
- categoría
- marca
- disponibilidad
- destacado
- vencimiento próximo
- rango de precio

Búsqueda:
- SKU
- nombre
- marca
- descripción

Orden:
- más reciente
- menor precio
- mayor descuento
- mayor stock
- nombre A-Z

Tarjeta producto:
- imagen
- nombre
- marca
- SKU
- categoría
- precio mayorista
- precio lista tachado si existe
- descuento porcentual si aplica
- stock disponible
- mínimo de compra
- unidad de venta
- badge destacado
- badge agotado
- badge vence pronto
- botón “Ver producto”

No implementar botón “Agregar al pedido” todavía. Si aparece, debe estar deshabilitado.

## Detalle producto
Ruta:
- `/producto/[id]`

Debe mostrar:
- imagen principal
- galería si existe
- nombre
- marca
- SKU
- categoría
- descripción
- precio lista
- precio liquidación/mayorista
- descuento porcentual
- stock disponible
- unidad de venta
- unidades por caja
- mínimo de compra
- fecha vencimiento
- estado
- condiciones generales

Textos obligatorios:
- “Precios exclusivos para compradores mayoristas aprobados.”
- “Stock informado sujeto a confirmación.”
- “Este catálogo no constituye una venta final confirmada.”

No implementar carrito ni pedido.

## Seguridad
Implementar o reforzar:
- requireAuth()
- requireRole()
- assertBuyerApproved()
- canAccessCampaign()
- canViewProduct()
- canManageProducts()

Reglas:
- Usuario no autenticado no ve catálogo.
- BUYER no aprobado no ve catálogo.
- BUYER no autorizado a campaña no ve productos.
- CLIENT_ADMIN no ve campañas ajenas.
- CLIENT_ADMIN no ve productos ajenos.
- SUPER_ADMIN_EXPOTECH ve todo.
- No exponer precios en HTML o API a usuarios no autorizados.

## ActivityLog
Registrar:
- product_created
- product_updated
- product_deactivated
- product_marked_sold_out
- product_import_started
- product_import_completed
- product_import_failed
- catalog_viewed
- product_viewed

## Seed demo
Agregar o actualizar:
- Categorías para “Venta Privada Mayorista Motherna”:
  - Bebés
  - Higiene personal
  - Lactancia
  - Cuidado familiar
  - Packs mayoristas

Agregar 20 productos ficticios:
- toallitas húmedas
- bolsas para leche materna
- shampoo bebé
- crema bebé
- protectores lactancia
- alcohol gel
- jabón líquido
- pasta dental infantil
- cepillo dental infantil
- pack higiene bebé
- pack cuidado familiar

Cada producto debe tener:
- SKU
- marca ficticia o Motherna Demo
- categoría
- precio lista
- precio mayorista
- stock
- mínimo
- unidad
- estado active
- algunos featured
- algunos sold_out

## UI
Usar Tailwind + shadcn/ui.
Diseño:
- B2B
- sobrio
- claro
- mobile-first
- tarjetas legibles
- filtros simples
- tablas limpias

Priorizar claridad comercial, no estética avanzada.

## Criterios de aceptación
1. Admin puede crear categoría.
2. Admin puede crear producto.
3. Admin puede editar producto.
4. Admin puede importar CSV con preview.
5. Admin ve errores de importación.
6. CLIENT_ADMIN ve solo productos de sus campañas.
7. BUYER aprobado ve catálogo privado.
8. BUYER pending/rejected/inactive no ve catálogo ni precios.
9. Usuario no autenticado no ve precios.
10. Detalle producto respeta permisos.
11. Filtros, búsqueda y ordenamiento funcionan.
12. ActivityLog registra vistas y cambios principales.
13. Seed crea productos demo.
14. No se implementó carrito, pedidos, pagos ni emails completos.

## Entrega esperada
Al terminar, reportar:
- archivos creados/modificados
- comandos ejecutados
- migraciones realizadas
- cómo probar admin productos
- cómo probar importación CSV
- cómo probar comprador aprobado
- cómo probar comprador no aprobado
- pendientes para Etapa 5
