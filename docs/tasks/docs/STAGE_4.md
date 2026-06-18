# Etapa 4 - Productos, importacion CSV y catalogo privado

## Alcance construido

- CRUD basico de productos para `SUPER_ADMIN_EXPOTECH`.
- Creacion automatica de categorias al cargar productos.
- Importacion CSV con preview local antes de guardar.
- Vista `/cliente/productos` filtrada por campañas del mandante.
- Catalogo privado `/catalogo` para compradores aprobados.
- Detalle privado `/producto/[id]` para compradores aprobados.
- Filtros por categoria, marca, precio, stock y vencimiento proximo.
- Busqueda por SKU, nombre o marca.
- Ordenamiento por reciente, precio, descuento, stock y nombre.
- Seed demo con categorias y productos.

## Control de acceso

- Usuarios sin sesion no ven productos ni precios.
- `BUYER` pendiente, rechazado o inactivo no ve productos ni precios.
- `BUYER` aprobado puede ver catalogo y detalle.
- `CLIENT_ADMIN` solo ve productos de campañas asociadas a su empresa.
- `SUPER_ADMIN_EXPOTECH` puede crear, editar e importar productos.

## Fuera de alcance

- Carrito.
- Pedidos.
- Checkout.
- Pagos.
- Emails completos.
- Metricas avanzadas.
- ERP.
- Logistica.
- Facturacion.
