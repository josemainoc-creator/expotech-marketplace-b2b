# Etapa 3 - Registro, invitaciones y aprobacion de compradores

## Alcance construido

- Solicitud de acceso B2B desde `/solicitar-acceso`.
- Registro de comprador B2B desde `/registro`.
- Invitaciones con token desde `/admin/invitaciones`.
- Ruta `/invitacion/[token]` con precarga de datos y marcado `opened`.
- Creacion de `Company`, `User BUYER` y `BuyerProfile pending`.
- Creacion/actualizacion de `LeadStatus`.
- Registro operativo en `ActivityLog`.
- Aprobacion y rechazo de compradores desde `/admin/compradores`.
- Vista `/mi-cuenta` con estado de comprador, empresa y solicitudes asociadas.

## Fuera de alcance

- Catalogo completo.
- Productos.
- Carrito.
- Pedidos.
- Emails completos o envio transaccional.
- Metricas y dashboards de conversion.
- Pagos.
- ERP.
- Logistica.

## Cuentas y datos demo

El seed crea:

- `admin@expotech.cl`
- `cliente@motherna.cl`
- `buyer@demo.cl`
- `pendiente@demo.cl`
- Invitacion `/invitacion/motherna-demo-token`

Todas las cuentas usan `Expotech2026!`.
