import type { UserRole } from "@prisma/client";

export type ProtectedRoute = {
  path: string;
  roles: UserRole[];
};

export const protectedRoutes: ProtectedRoute[] = [
  { path: "/admin", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/campanas", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/campanas/nueva", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/campanas/[id]", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/productos", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/productos/nuevo", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/productos/importar", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/productos/[id]", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/pedidos", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/pedidos/[id]", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/reportes", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/export/[type]", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/compradores", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/admin/invitaciones", roles: ["SUPER_ADMIN_EXPOTECH"] },
  { path: "/cliente", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/campanas", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/campanas/[id]", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/productos", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/pedidos", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/pedidos/[id]", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/reportes", roles: ["CLIENT_ADMIN"] },
  { path: "/cliente/export/[type]", roles: ["CLIENT_ADMIN"] },
  { path: "/mi-cuenta", roles: ["BUYER"] },
  { path: "/catalogo", roles: ["BUYER"] },
  { path: "/producto/[id]", roles: ["BUYER"] },
  { path: "/carrito", roles: ["BUYER"] },
  { path: "/pedido-confirmado", roles: ["BUYER"] },
  { path: "/mis-pedidos", roles: ["BUYER"] },
  { path: "/mis-pedidos/[id]", roles: ["BUYER"] }
];
