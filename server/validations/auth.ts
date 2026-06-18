import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un email valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});
