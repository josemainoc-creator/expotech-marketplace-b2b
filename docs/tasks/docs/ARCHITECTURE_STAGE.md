# Etapa 1 - Arquitectura inicial

## Alcance construido

La base del proyecto queda preparada para crecer por modulos siguiendo `docs/EXPOTECH_MARKETPLACE_SPEC.md`.

Incluye:

- Configuracion Next.js, TypeScript y Tailwind.
- Componentes UI base.
- Prisma con PostgreSQL.
- Modelo de datos del dominio.
- Auth.js/NextAuth con credenciales.
- Middleware y helpers de acceso por rol.
- Rutas iniciales protegidas.
- `.env.example` con variables obligatorias y variables reservadas para etapas posteriores.
- README inicial con instalacion local y alcance.

## Limites respetados

No se implementaron:

- Carrito.
- Catalogo completo.
- Emails.
- Metricas.
- Pagos.
- Logistica automatica.
- ERP.

Los modelos `Order`, `OrderItem`, `EmailLog` y `ActivityLog` existen solo como contrato de datos de la especificacion, sin flujos funcionales asociados en esta etapa.

## Rutas activas en Etapa 1

Publicas:

- `/`
- `/login`
- `/registro`
- `/solicitar-acceso`
- `/invitacion/[token]`
- `/campana/[slug]`

Protegidas:

- `/admin`
- `/admin/campanas`
- `/admin/campanas/nueva`
- `/admin/campanas/[id]`
- `/admin/productos`
- `/admin/productos/nuevo`
- `/admin/productos/importar`
- `/admin/compradores`
- `/admin/invitaciones`
- `/cliente`
- `/cliente/productos`
- `/catalogo`
- `/producto/[id]`

Las rutas de carrito, pedidos y metricas se agregaran cuando corresponda a sus etapas funcionales.
