import type { UserRole } from "@prisma/client";

export const roleHome: Record<UserRole, string> = {
  SUPER_ADMIN_EXPOTECH: "/admin",
  CLIENT_ADMIN: "/cliente",
  BUYER: "/mi-cuenta"
};

export function hasRole(role: UserRole | undefined, allowedRoles: UserRole[]) {
  return Boolean(role && allowedRoles.includes(role));
}

export function isExpotechAdmin(role: UserRole | undefined) {
  return role === "SUPER_ADMIN_EXPOTECH";
}
