[TASK_STAGE_03.md](https://github.com/user-attachments/files/29072415/TASK_STAGE_03.md)
# TASK_STAGE_03.md
# Expotech Marketplace B2B — Etapa 3
## Registro de compradores, invitaciones y aprobación

## Alcance
Implementar solo:
- Solicitud de acceso comprador B2B.
- Registro o reutilización de Company/User/BuyerProfile.
- Invitaciones privadas con token.
- Panel admin para aprobar, rechazar o desactivar compradores.
- Vista comprador `/mi-cuenta`.
- LeadStatus básico.
- ActivityLog básico.

No implementar:
- Catálogo.
- Productos.
- Carrito.
- Pedidos.
- Emails completos.
- Métricas avanzadas.
- Pagos.
- ERP.
- Logística.

## Regla crítica
Ningún comprador debe ver productos ni precios en esta etapa. La aprobación solo prepara el acceso para etapas futuras.

## Roles
- SUPER_ADMIN_EXPOTECH: aprueba, rechaza y desactiva compradores.
- CLIENT_ADMIN: no aprueba compradores globales.
- BUYER: solicita acceso y ve su estado en `/mi-cuenta`.

## Modelos
Usar o completar:
- User
- Company
- BuyerProfile
- Campaign
- Invitation
- LeadStatus
- ActivityLog

## Estados
BuyerProfile.approvalStatus:
- pending
- approved
- rejected
- inactive

Invitation.status:
- created
- sent
- opened
- registered
- expired
- cancelled

LeadStatus.status:
- new
- contacted
- interested
- pending_approval
- approved
- rejected
- inactive

## Flujo 1: Solicitud de acceso
Ruta:
- `/solicitar-acceso`
- o `/campana/[slug]/solicitar-acceso`

Formulario:
- Nombre empresa
- RUT
- Giro/tipo negocio
- Tipo comercio
- Nombre contacto
- Email
- Teléfono
- Región
- Comuna
- Dirección
- Volumen estimado compra
- Categorías de interés
- Mensaje opcional
- Aceptación de términos

Tipos comercio:
- farmacia independiente
- pañalera
- minimarket
- perfumería
- distribuidor regional
- tienda de bebé
- tienda de barrio
- mayorista
- comercio online
- otro

Validar con Zod:
- email válido
- RUT obligatorio
- empresa obligatoria
- teléfono obligatorio
- tipo comercio obligatorio
- región/comuna obligatorias
- términos aceptados
- evitar duplicar User por email
- evitar duplicar Company por RUT si es posible

Al enviar:
- Crear/reutilizar Company.
- Crear/reutilizar User BUYER.
- Crear/actualizar BuyerProfile pending.
- Asociar a Campaign si viene desde campaña.
- Crear/actualizar LeadStatus.
- Crear ActivityLog `buyer_access_requested`.
- Mostrar: “Solicitud recibida. Revisaremos tus datos comerciales y te avisaremos cuando tengas acceso a la venta privada.”

## Flujo 2: Invitaciones
Rutas:
- `/admin/invitaciones`
- `/invitacion/[token]`

Admin crea invitación con:
- Campaign
- email
- empresa opcional
- contacto opcional
- teléfono opcional
- expiración
- nota interna

Reglas:
- token seguro y único
- estado inicial `created`
- permitir marcar `sent` sin email real todavía
- token expirado marca `expired` y no registra
- token válido marca `opened` al visitarse
- al completar formulario marca `registered`

Al registrar invitado:
- Crear/reutilizar Company.
- Crear/reutilizar User BUYER.
- Crear/actualizar BuyerProfile pending.
- Asociar Campaign.
- Actualizar LeadStatus.
- ActivityLog `invitation_registered`.

Por defecto no autoaprobar invitados.

## Flujo 3: Admin compradores
Rutas:
- `/admin/compradores`
- `/admin/compradores/[id]`

Tabla:
- empresa
- RUT
- tipo comercio
- contacto
- email
- teléfono
- región
- comuna
- estado aprobación
- campaña
- fecha solicitud
- última actividad
- prioridad

Filtros:
- estado
- tipo comercio
- región
- campaña
- búsqueda por empresa, RUT, email o contacto

Acciones:
- aprobar
- rechazar con motivo
- desactivar
- cambiar prioridad
- agregar nota interna

Al aprobar:
- BuyerProfile.approvalStatus = approved
- approvedAt = now
- LeadStatus.status = approved
- ActivityLog `buyer_approved`

Al rechazar:
- BuyerProfile.approvalStatus = rejected
- rejectedReason
- LeadStatus.status = rejected
- ActivityLog `buyer_rejected`

Al desactivar:
- BuyerProfile.approvalStatus = inactive
- LeadStatus.status = inactive
- ActivityLog `buyer_deactivated`

## Flujo 4: Mi cuenta
Ruta:
- `/mi-cuenta`

BUYER ve:
- datos empresa
- datos contacto
- estado aprobación

Mensajes:
Pending: “Tu solicitud está en revisión. Te notificaremos cuando tu acceso sea aprobado.”
Approved: “Tu acceso fue aprobado. Podrás ingresar al catálogo privado cuando la campaña esté disponible.”
Rejected: “Tu solicitud no fue aprobada por ahora. Si crees que corresponde una revisión, contacta al equipo comercial de Expotech.”
Inactive: “Tu cuenta se encuentra inactiva. Contacta al equipo comercial de Expotech.”

No mostrar catálogo.

## ActivityLog
Registrar:
- buyer_access_requested
- invitation_created
- invitation_opened
- invitation_registered
- buyer_approved
- buyer_rejected
- buyer_deactivated
- lead_note_added
- lead_priority_changed

## Seguridad
- Rutas admin protegidas.
- Solo SUPER_ADMIN_EXPOTECH aprueba/rechaza/desactiva.
- BUYER solo ve su cuenta.
- BUYER no entra a `/admin` ni `/cliente`.
- Token expirado no sirve.
- No mostrar stack traces.
- Usar Zod.

## Seed demo
Agregar:
- Campaña “Venta Privada Mayorista Motherna”.
- 3 invitaciones demo.
- 5 compradores demo: 2 pending, 2 approved, 1 rejected.
- LeadStatus para cada comprador.
- ActivityLog básico.

## Criterios aceptación
- Solicitud de acceso funciona.
- Crea/reutiliza Company, User y BuyerProfile pending.
- Admin ve compradores pendientes.
- Admin aprueba/rechaza/desactiva.
- Invitación válida abre formulario.
- Invitación expirada no registra.
- Invitación cambia a opened y registered.
- Buyer ve estado en `/mi-cuenta`.
- Buyer no entra a `/admin` ni `/cliente`.
- Client admin no aprueba compradores globales.
- LeadStatus y ActivityLog funcionan.
- No se implementó catálogo, carrito, productos, pedidos ni emails completos.
- Add task stage 3 specification
