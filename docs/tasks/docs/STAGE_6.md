# Etapa 6 - Emails, exportaciones y reporte operativo

## Alcance implementado

- Emails transaccionales basicos para pedidos recibidos y cambios de estado.
- Registro operativo en `EmailLog` para emails enviados, fallidos o pendientes de configuracion.
- Exportaciones CSV y XLSX de pedidos, items y compradores.
- Reporte operativo simple para admin Expotech.
- Reporte operativo simple para cliente/mandante con ownership por campana.

## Rutas agregadas

Admin Expotech:

- `/admin/reportes`
- `/admin/export/pedidos?format=csv`
- `/admin/export/pedidos?format=xlsx`
- `/admin/export/items?format=csv`
- `/admin/export/items?format=xlsx`
- `/admin/export/compradores?format=csv`
- `/admin/export/compradores?format=xlsx`

Cliente / mandante:

- `/cliente/reportes`
- `/cliente/export/pedidos?format=csv`
- `/cliente/export/pedidos?format=xlsx`
- `/cliente/export/items?format=csv`
- `/cliente/export/items?format=xlsx`
- `/cliente/export/compradores?format=csv`
- `/cliente/export/compradores?format=xlsx`

## Variables de entorno

```bash
RESEND_API_KEY=""
EMAIL_FROM="Expotech <no-reply@expotech.cl>"
EXPOTECH_INTERNAL_EMAIL="admin@expotech.cl"
```

Si `RESEND_API_KEY` o `EMAIL_FROM` no estan configurados, el sistema no bloquea la creacion del pedido: deja un registro `EmailLog` con estado `failed` y razon `missing_resend_configuration`.

## Reglas de acceso

- `SUPER_ADMIN_EXPOTECH` puede ver reportes y exportaciones globales.
- `CLIENT_ADMIN` solo ve reportes y exportaciones de pedidos asociados a campanas de su empresa.
- `BUYER` no accede a reportes ni exportaciones admin/cliente.
- Usuarios sin sesion siguen redirigidos por middleware.

## Fuera de alcance

- Pago online.
- Checkout pagado.
- Facturacion.
- ERP.
- Logistica.
- Despacho automatico.
- Marketing automation.
- BI avanzado.
