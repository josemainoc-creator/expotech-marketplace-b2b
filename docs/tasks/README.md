# Expotech Marketplace B2B

Base del proyecto para una plataforma privada de ventas mayoristas B2B por invitacion.

## Estado actual

Etapa 7 implementada: usuarios, empresas, roles, campanas, solicitudes de acceso, invitaciones, aprobacion de compradores, productos, categorias, catalogo privado, carrito, solicitudes de pedido, emails transaccionales basicos, exportaciones, reportes operativos simples, seed final demo, QA critico y checklist de deploy.

Incluye:

- Next.js App Router con TypeScript.
- Tailwind CSS y componentes base compatibles con shadcn/ui.
- Prisma configurado para PostgreSQL.
- Schema Prisma del dominio Expotech.
- Auth.js/NextAuth con provider de credenciales.
- Roles base: `SUPER_ADMIN_EXPOTECH`, `CLIENT_ADMIN`, `BUYER`.
- Middleware de rutas protegidas.
- Helpers de acceso: `requireAuth`, `requireRole`, `canAccessCampaign`, `canAccessOrder`, `assertBuyerApproved`.
- Rutas base publicas, de autenticacion, admin, cliente y catalogo privado.
- `.env.example` con variables obligatorias y reservadas para etapas posteriores.
- CRUD basico de campanas para `SUPER_ADMIN_EXPOTECH`.
- Panel cliente con campañas filtradas por empresa mandante.
- Registro de compradores B2B con perfil `pending`.
- Invitaciones con token y precarga de datos.
- Aprobacion/rechazo de compradores desde admin.
- `LeadStatus` y `ActivityLog` para bitacora operativa.
- CRUD basico de productos para Expotech.
- Importacion CSV con preview local.
- Catalogo privado para compradores aprobados.
- Detalle privado de producto.
- Vista de productos para mandantes filtrada por ownership.
- Carrito local para compradores aprobados.
- Solicitud de pedido con `Order` y `OrderItems`.
- Confirmacion de pedido recibido.
- Historial comprador.
- Vistas basicas de pedidos para admin y cliente.
- Emails transaccionales basicos de pedidos.
- `EmailLog` para trazabilidad de envios.
- Exportaciones CSV/XLSX de pedidos, items y compradores.
- Reportes operativos simples para admin y cliente.
- Seed final demo para probar roles, ownership, productos, pedidos, exports y emails.
- Script de QA critico sin dependencias externas.
- Checklist de deploy para Vercel/PostgreSQL/Resend.

Fuera de alcance en esta etapa:

- Pago online.
- Checkout pagado.
- Facturacion, ERP, logistica o app movil.
- Emails transaccionales avanzados.
- Marketing automation.
- BI avanzado.

## Requisitos

- Node.js 20 LTS recomendado
- PostgreSQL
- npm

## Instalacion local

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run qa:critical
npm run dev
```

La aplicacion queda disponible en:

```bash
http://localhost:3000
```

## Guia final local y pre-demo

### Version recomendada de Node

Usar Node.js 20 LTS. En una terminal con Node disponible:

```bash
node -v
npm -v
```

### Instalacion con npm

```bash
npm install
```

Este comando instala dependencias y crea `package-lock.json` si no existe. Para demos o deploys, conservar ese archivo en el repositorio para fijar versiones.

### Configurar `.env`

En macOS/Linux:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Variables requeridas:

```bash
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
AUTH_TRUST_HOST
APP_BASE_URL
EMAIL_FROM
EXPOTECH_INTERNAL_EMAIL
```

Variable opcional para envio real:

```bash
RESEND_API_KEY
```

### Configurar `DATABASE_URL`

Formato:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Ejemplo local:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expotech_marketplace"
```

Antes de migrar, crear la base en PostgreSQL si no existe:

```sql
CREATE DATABASE expotech_marketplace;
```

### Modo dev/mock sin Resend

Se puede operar sin `RESEND_API_KEY` en desarrollo:

```bash
RESEND_API_KEY=""
EMAIL_FROM="Expotech <no-reply@expotech.cl>"
EXPOTECH_INTERNAL_EMAIL="admin@expotech.cl"
```

En este modo, los pedidos y cambios de estado no se bloquean. El sistema deja registros en `EmailLog` con estado `failed` y razon `missing_resend_configuration`.

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Para inspeccionar datos:

```bash
npm run prisma:studio
```

### Build checklist

```bash
npm run qa:critical
npm test
npm run typecheck
npm run build
```

Si el build pasa, probar modo produccion:

```bash
npm run start
```

### QA manual en navegador

1. Abrir `http://localhost:3000`.
2. Ingresar como `admin@expotech.cl` y revisar `/admin`, `/admin/pedidos`, `/admin/reportes`.
3. Crear o editar una campana desde `/admin/campanas`.
4. Crear o editar un producto desde `/admin/productos`.
5. Descargar CSV/XLSX desde `/admin/reportes`.
6. Ingresar como `cliente@motherna.cl` y confirmar que solo ve datos Motherna.
7. Ingresar como `cliente@andes.cl` y confirmar que solo ve datos Andes.
8. Descargar CSV/XLSX desde `/cliente/reportes`.
9. Ingresar como `buyer@demo.cl`, abrir `/catalogo`, ver precios y agregar productos.
10. Crear pedido desde `/carrito` y revisar `/pedido-confirmado`.
11. Revisar historial en `/mis-pedidos`.
12. Ingresar como `pendiente@demo.cl`, `rechazado@demo.cl` o `inactivo@demo.cl` y confirmar que no ve catalogo ni precios.
13. Probar una ruta protegida sin sesion y confirmar redireccion a `/login`.
14. Revisar `/admin/reportes` para confirmar registros recientes de `EmailLog`.

### Errores esperados y correcciones

- `npm no se reconoce`: instalar Node.js 20 LTS y abrir una terminal nueva.
- `node_modules no existe`: ejecutar `npm install`.
- `package-lock.json no existe`: ejecutar `npm install` y conservar el lockfile generado.
- `Prisma Client did not initialize`: ejecutar `npm run prisma:generate`.
- `P1001 Can't reach database server`: iniciar PostgreSQL y revisar host/puerto en `DATABASE_URL`.
- `database does not exist`: crear la base `expotech_marketplace` o ajustar `DATABASE_URL`.
- Error de migracion Prisma: revisar `DATABASE_URL`, ejecutar `npm run prisma:migrate` y confirmar permisos del usuario PostgreSQL.
- Login falla con cuentas demo: ejecutar `npm run prisma:seed` y usar password `Expotech2026!`.
- Emails quedan `failed`: esperado si `RESEND_API_KEY` esta vacio en dev/mock.
- Error de Auth/URL en deploy: revisar `NEXTAUTH_URL`, `AUTH_TRUST_HOST` y `APP_BASE_URL`.
- Build falla por tipos: ejecutar `npm run typecheck` para ver el archivo exacto antes de desplegar.

## Variables de entorno

Obligatorias para esta etapa:

```bash
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
APP_BASE_URL
AUTH_TRUST_HOST
EMAIL_FROM
EXPOTECH_INTERNAL_EMAIL
```

Opcional para envio real de emails:

```bash
RESEND_API_KEY
```

Reservadas para etapas posteriores:

```bash
STORAGE_PROVIDER
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Rutas base

Publicas y autenticacion:

- `/`
- `/login`
- `/registro`
- `/solicitar-acceso`
- `/invitacion/[token]`
- `/campana/[slug]`

Comprador:

- `/catalogo`
- `/producto/[id]`
- `/carrito`
- `/pedido-confirmado`
- `/mis-pedidos`
- `/mis-pedidos/[id]`

Admin Expotech:

- `/admin`
- `/admin/campanas`
- `/admin/campanas/nueva`
- `/admin/campanas/[id]`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/importar`
- `/admin/productos/[id]`
- `/admin/pedidos`
- `/admin/pedidos/[id]`
- `/admin/reportes`
- `/admin/export/[type]`
- `/admin/compradores`
- `/admin/invitaciones`

Cliente / mandante:

- `/cliente`
- `/cliente/campanas`
- `/cliente/campanas/[id]`
- `/cliente/productos`
- `/cliente/pedidos`
- `/cliente/pedidos/[id]`
- `/cliente/reportes`
- `/cliente/export/[type]`

Comprador:

- `/mi-cuenta`
- `/catalogo`
- `/producto/[id]`
- `/carrito`
- `/mis-pedidos`

## Cuentas demo

El seed crea estas cuentas con la misma contrasena:

```bash
Expotech2026!
```

- SUPER_ADMIN_EXPOTECH: `admin@expotech.cl`
- CLIENT_ADMIN: `cliente@motherna.cl`
- CLIENT_ADMIN: `cliente@andes.cl`
- BUYER: `buyer@demo.cl`
- BUYER pendiente: `pendiente@demo.cl`
- BUYER rechazado: `rechazado@demo.cl`
- BUYER inactivo: `inactivo@demo.cl`
- BUYER aprobado adicional: `farmacia.norte@demo.cl`
- BUYER aprobado adicional: `panalera.sur@demo.cl`
- BUYER aprobado adicional: `mayorista.centro@demo.cl`
- BUYER aprobado adicional: `minimarket.costa@demo.cl`
- Invitacion demo: `/invitacion/motherna-demo-token`

## QA y build

```bash
npm run qa:critical
npm run typecheck
npm run build
```

`qa:critical` revisa por lectura estatica reglas sensibles de permisos, catalogo, pedidos, exportaciones, reportes, emails y seed final. No reemplaza pruebas end-to-end, pero sirve como preflight rapido antes de deploy.

## Pruebas manuales de roles

1. Ingresar con `admin@expotech.cl` y abrir `/admin`.
2. Crear una campana desde `/admin/campanas/nueva`.
3. Editar una campana desde `/admin/campanas/[id]` y cambiar su estado.
4. Ingresar con `cliente@motherna.cl` y abrir `/cliente/campanas`.
5. Confirmar que el cliente solo ve campanas asociadas a Motherna Demo.
6. Ingresar con `buyer@demo.cl` y abrir `/mi-cuenta`.
7. Confirmar que el comprador no puede entrar a `/admin` ni `/cliente`.
8. Abrir `/solicitar-acceso` y enviar una nueva solicitud B2B.
9. Abrir `/admin/compradores` como admin y aprobar o rechazar compradores.
10. Abrir `/admin/invitaciones`, crear una invitacion y probar el enlace `/invitacion/[token]`.
11. Abrir `/admin/productos` como admin y crear/editar productos.
12. Abrir `/admin/productos/importar` y pegar un CSV con las columnas requeridas.
13. Entrar como comprador aprobado y abrir `/catalogo`.
14. Entrar como comprador pendiente y confirmar que no ve productos ni precios.
15. Como comprador aprobado, agregar productos al carrito y abrir `/carrito`.
16. Probar minimo por producto, stock referencial y minimo de campaña.
17. Enviar solicitud y revisar `/pedido-confirmado`.
18. Ver historial en `/mis-pedidos`.
19. Como admin, revisar `/admin/pedidos`.
20. Como cliente, revisar `/cliente/pedidos`.
21. Como comprador aprobado, enviar una solicitud de pedido y revisar registros en `EmailLog`.
22. Como admin, abrir `/admin/reportes` y descargar CSV/XLSX.
23. Como cliente, abrir `/cliente/reportes` y confirmar que solo aparecen pedidos propios.
24. Ingresar como `cliente@motherna.cl` y confirmar que no ve pedidos/productos Andes.
25. Ingresar como `cliente@andes.cl` y confirmar que solo ve la campana Andes.
26. Abrir `/admin/reportes` como admin y confirmar que ve pedidos de ambos mandantes.

## Deploy

Ver checklist completo en `docs/DEPLOY_CHECKLIST.md`.

Resumen:

1. Configurar PostgreSQL y variables de entorno.
2. Ejecutar `npm run prisma:generate`.
3. Ejecutar `npm run prisma:migrate`.
4. Ejecutar `npm run prisma:seed` solo si se quieren datos demo.
5. Ejecutar `npm run qa:critical`, `npm run typecheck` y `npm run build`.
6. Configurar dominio/remitente Resend antes de activar emails reales.

## Siguientes pasos sugeridos

1. Ejecutar QA end-to-end en un entorno con PostgreSQL real y navegador.
2. Configurar dominio y remitente real de Resend.
3. Rotar `NEXTAUTH_SECRET` por un secreto fuerte en produccion.
4. Definir backups, monitoreo y retencion de logs.
5. Agregar suite automatizada de UI/API cuando se defina herramienta de testing.
