import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const invitationSchema = z.object({
  campaignId: z.string().min(1, "Selecciona una campana."),
  email: z.string().email("Ingresa un email valido."),
  companyName: z.preprocess(emptyToUndefined, z.string().optional()),
  contactName: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  expiresAt: z.preprocess(emptyToUndefined, z.coerce.date().optional())
});
