# TASK_STAGE_07.md
# Expotech Marketplace B2B — Etapa 7
## QA, hardening, seed final, documentación y preparación de deploy

## Alcance
Implementar solo:
- Revisión funcional end-to-end del MVP.
- Hardening de seguridad por roles y ownership.
- Limpieza de errores visibles.
- Seed final de demo/piloto.
- Variables de entorno documentadas.
- README operativo.
- Checklist de deploy.
- Checklist de prueba para piloto comercial.
- Limpieza de rutas/documentos duplicados si aplica.
- Tests básicos de reglas críticas.

No implementar:
- Pago online.
- Checkout pagado.
- Facturación electrónica.
- ERP.
- Logística.
- Despacho automático.
- Marketing automation masivo.
- BI avanzado.
- App móvil nativa.

## Regla crítica
El MVP debe quedar listo para demo/piloto comercial, no para escalar a producción masiva todavía.

El sistema debe mantener el mensaje comercial:
“Este pedido no constituye una venta final confirmada. El stock, precio, condiciones de pago y despacho serán validados por el equipo comercial antes de su confirmación.”

## Contexto
Ya existen:
- roles y usuarios
- campañas
- compradores e invitaciones
- aprobación/rechazo
- productos y categorías
- importación CSV
- catálogo privado
- carrito y solicitud de pedido
- Order y OrderItems
- historial comprador
- panel admin pedidos
- panel cliente pedidos
- emails básicos
- EmailLog
- exportaciones
- reportes operativos simples

## Objetivo de Etapa 7
Dejar el proyecto en un estado estable y demostrable para piloto con una marca/mandante como Motherna.

## Revisión funcional obligatoria
Verificar y corregir si falla:

1. SUPER_ADMIN_EXPOTECH
- inicia sesión
- ve dashboard admin
- crea campaña
- crea/importa productos
- ve compradores
- aprueba/rechaza compradores
- ve catálogo
- ve todos los pedidos
- cambia estados
- exporta pedidos/items/compradores
- ve reportes

2. CLIENT_ADMIN
- inicia sesión
- ve solo campañas propias
- ve solo productos propios
- ve solo pedidos propios
- cambia estado de pedidos propios
- exporta solo información propia
- ve reportes propios
- no accede a información de otros mandantes

3. BUYER approved
- inicia sesión
- ve catálogo y precios
- ve detalle producto
- agrega al carrito
- valida mínimos y stock
- envía solicitud de pedido
- ve confirmación
- ve historial propio
- no ve pedidos ajenos

4. BUYER pending/rejected/inactive
- no ve catálogo
- no ve precios
- no agrega productos
- ve estado correcto en `/mi-cuenta`

5. Usuario no autenticado
- no ve catálogo privado
- no ve precios
- no crea pedido
- puede solicitar acceso si la ruta existe

## Seguridad y ownership
Reforzar:
- requireAuth
- requireRole
- assertBuyerApproved
- canAccessCampaign
- canViewProduct
- canCreateOrder
- canViewOrder
- canManageOrder
- canExportOrders
- canViewReports

Reglas:
- No confiar en datos enviados por frontend.
- Recalcular precios y totales en backend.
- Validar ownership en backend.
- CLIENT_ADMIN nunca ve campañas ajenas.
- BUYER nunca ve pedidos ajenos.
- Usuario no aprobado nunca ve precios.
- Exports respetan permisos.
- Reportes respetan permisos.

## Manejo de errores
Mejorar:
- errores amigables para usuario
- no mostrar stack traces
- mensajes claros en formularios
- redirecciones correctas
- estados vacíos en tablas
- loading states básicos si existen

## Tests básicos
Agregar o completar tests para:
- comprador aprobado puede ver catálogo
- comprador pendiente no ve catálogo
- usuario no autenticado no ve catálogo
- validación de mínimo de compra
- validación de stock
- creación de pedido submitted
- BUYER no ve pedido ajeno
- CLIENT_ADMIN no ve pedido/campaña ajena
- exportación cliente respeta ownership
- email fallido no bloquea pedido

Usar la herramienta ya presente en el proyecto. Si no existe framework de tests, agregar Vitest solo si no complejiza demasiado.

## Seed final
Actualizar seed para demo/piloto:

Usuarios:
- admin@expotech.cl — SUPER_ADMIN_EXPOTECH
- cliente@motherna-demo.cl — CLIENT_ADMIN
- comprador.aprobado@demo.cl — BUYER approved
- comprador.pendiente@demo.cl — BUYER pending
- comprador.rechazado@demo.cl — BUYER rejected

Mandante:
- Motherna Demo

Campaña:
- Venta Privada Mayorista Motherna
- estado active
- duración demo de 15 días

Categorías:
- Bebés
- Higiene personal
- Lactancia
- Cuidado familiar
- Packs mayoristas

Productos:
- mínimo 20 productos demo
- algunos featured
- algunos sold_out
- precios mayoristas
- stock realista
- mínimos de compra

Pedidos:
- mínimo 5 pedidos demo
- estados: submitted, under_review, approved, rejected, fulfilled
- items variados

EmailLog:
- algunos logs sent
- algunos failed

ActivityLog:
- registros básicos para demo

## README operativo
Actualizar README con:
- descripción del proyecto
- alcance MVP
- qué no incluye
- roles
- flujo comercial
- instalación local
- variables de entorno
- comandos útiles
- migraciones
- seed
- cómo correr
- cómo probar roles
- cómo probar pedido
- cómo probar exports
- cómo probar emails en modo dev/mock
- deploy sugerido

## Variables de entorno
Documentar en `.env.example`:
- DATABASE_URL
- NEXTAUTH_SECRET o AUTH_SECRET
- NEXTAUTH_URL o AUTH_URL
- APP_BASE_URL
- RESEND_API_KEY
- EMAIL_FROM
- INTERNAL_SALES_EMAIL
- STORAGE_PROVIDER si aplica
- cualquier variable real usada por el proyecto

## Deploy
Preparar checklist de deploy:
- base PostgreSQL configurada
- variables de entorno
- migraciones aplicadas
- seed opcional
- build exitoso
- rutas protegidas probadas
- usuario admin creado
- emails en modo real o mock controlado

No implementar infraestructura compleja. Solo dejar documentación y build estable.

## Limpieza documental
Si existen carpetas duplicadas por error como:
- `docs/tasks/docs/tasks`

Eliminar solo si es seguro y no afecta archivos correctos.
Mantener:
- `docs/tasks/TASK_STAGE_03.md`
- `docs/tasks/TASK_STAGE_04.md`
- `docs/tasks/TASK_STAGE_05.md`
- `docs/tasks/TASK_STAGE_06.md`
- `docs/tasks/TASK_STAGE_07.md`

## Criterios de aceptación
1. Build pasa.
2. Seed corre.
3. Admin demo puede operar.
4. Cliente demo solo ve lo propio.
5. Buyer approved completa flujo hasta pedido.
6. Buyer pending no ve precios.
7. Exportaciones respetan permisos.
8. Emails fallidos no rompen flujo.
9. Reportes respetan permisos.
10. README permite levantar el proyecto.
11. `.env.example` está completo.
12. Tests críticos pasan o quedan documentados si no hay framework.
13. No se agregó pago, facturación, ERP ni logística.

## Entrega esperada
Reportar:
- archivos creados/modificados
- comandos ejecutados
- variables nuevas
- migraciones realizadas
- resultado de build/test
- cómo probar flujo admin
- cómo probar flujo cliente
- cómo probar flujo comprador aprobado
- cómo probar comprador pendiente
- cómo probar exports
- cómo probar emails
- pendientes reales para producción
