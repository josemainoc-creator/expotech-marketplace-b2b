export const userRoles = ["SUPER_ADMIN_EXPOTECH", "CLIENT_ADMIN", "BUYER"] as const;
export type UserRole = (typeof userRoles)[number];

export const protectedPrefixes = ["/admin", "/cliente", "/catalogo", "/producto"] as const;
