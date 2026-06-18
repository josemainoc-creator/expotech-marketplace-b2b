# Checklist de deploy - Expotech Marketplace B2B

## Predeploy local

- Instalar dependencias con `npm install`.
- Configurar `.env` desde `.env.example`.
- Confirmar PostgreSQL disponible y `DATABASE_URL` correcto.
- Ejecutar `npm run prisma:generate`.
- Ejecutar `npm run prisma:migrate`.
- Ejecutar `npm run prisma:seed`.
- Ejecutar `npm run qa:critical`.
- Ejecutar `npm run typecheck`.
- Ejecutar `npm run build`.

## Variables requeridas

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_TRUST_HOST`
- `APP_BASE_URL`
- `EMAIL_FROM`
- `EXPOTECH_INTERNAL_EMAIL`

## Variables para emails reales

- `RESEND_API_KEY`

Si `RESEND_API_KEY` no esta configurada, los emails no bloquean el flujo principal y quedan registrados como fallidos en `EmailLog`.

## Vercel

- Crear proyecto conectado al repositorio.
- Configurar PostgreSQL externo o administrado.
- Cargar variables de entorno de produccion.
- Ejecutar migraciones antes de promover a produccion.
- Validar dominio publico y `NEXTAUTH_URL`.
- Validar `APP_BASE_URL` para links dentro de emails.
- Configurar dominio/remitente en Resend antes de habilitar emails reales.

## QA postdeploy

- Login admin: `admin@expotech.cl`.
- Login mandante Motherna: `cliente@motherna.cl`.
- Login mandante Andes: `cliente@andes.cl`.
- Login comprador aprobado: `buyer@demo.cl`.
- Login comprador pendiente: `pendiente@demo.cl`.
- Confirmar que compradores no aprobados no ven catalogo ni precios.
- Crear pedido como comprador aprobado.
- Revisar pedido en `/admin/pedidos`.
- Revisar que `cliente@motherna.cl` no vea pedidos de Andes.
- Descargar CSV/XLSX desde `/admin/reportes`.
- Descargar CSV/XLSX desde `/cliente/reportes`.
- Revisar `EmailLog` reciente en `/admin/reportes`.

## Fuera de alcance del MVP

- Pago online.
- Checkout pagado.
- Facturacion electronica.
- ERP.
- Logistica automatica.
- Despacho automatico.
- Marketing automation.
- BI avanzado.
