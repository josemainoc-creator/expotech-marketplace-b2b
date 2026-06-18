# Etapa 7 - QA funcional y hardening

## Alcance implementado

- Hardening del helper `canAccessOrder` para que un comprador solo valide pedidos creados por su propio usuario.
- Seed final demo con dos mandantes, 8 compradores, 25 productos totales y 5 pedidos demo.
- Script `npm run qa:critical` para revisar reglas criticas de permisos, catalogo, pedidos, exportaciones y emails.
- README operativo actualizado.
- Checklist de deploy para Vercel/PostgreSQL/Resend.

## Cuentas demo

Todas usan la password:

```bash
Expotech2026!
```

- `admin@expotech.cl` - SUPER_ADMIN_EXPOTECH.
- `cliente@motherna.cl` - CLIENT_ADMIN Motherna.
- `cliente@andes.cl` - CLIENT_ADMIN Andes.
- `buyer@demo.cl` - BUYER approved.
- `pendiente@demo.cl` - BUYER pending.
- `rechazado@demo.cl` - BUYER rejected.
- `inactivo@demo.cl` - BUYER inactive.

## Flujos criticos a probar

1. BUYER approved entra a `/catalogo`, ve precios, agrega productos y crea pedido.
2. BUYER pending/rejected/inactive no entra a catalogo, producto, carrito ni pedidos.
3. Usuario sin sesion es redirigido a `/login`.
4. BUYER solo ve `/mis-pedidos` propios.
5. CLIENT_ADMIN Motherna solo ve productos, pedidos, reportes y exports de Motherna.
6. CLIENT_ADMIN Andes solo ve productos, pedidos, reportes y exports de Andes.
7. SUPER_ADMIN_EXPOTECH ve todo en `/admin`.
8. Emails fallidos no bloquean creacion de pedido ni cambio de estado.
9. Exportaciones CSV/XLSX respetan permisos.
10. Reportes admin/cliente respetan permisos.

## Comandos QA

```bash
npm run qa:critical
npm run typecheck
npm run build
```

## Pendientes reales para produccion

- Ejecutar y guardar evidencia de QA end-to-end en entorno con PostgreSQL real.
- Configurar dominio y remitente Resend.
- Rotar `NEXTAUTH_SECRET` con secreto fuerte.
- Revisar backups y monitoreo del PostgreSQL productivo.
- Agregar tests automatizados de UI/API cuando el stack de testing quede definido.
- Definir politica de retencion para `ActivityLog` y `EmailLog`.
