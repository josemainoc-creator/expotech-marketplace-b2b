import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const campaignSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Usa solo minusculas, numeros y guiones."),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  clientCompanyId: z.preprocess(emptyToUndefined, z.string().optional()),
  newClientCompanyName: z.preprocess(emptyToUndefined, z.string().min(3).optional()),
  shortDescription: z.preprocess(emptyToUndefined, z.string().max(240).optional()),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  startDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  endDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  status: z.enum(["draft", "active", "paused", "closed", "archived"]).default("draft"),
  accessType: z.enum(["invitation_only", "approval_required"]).default("invitation_only"),
  termsAndConditions: z.preprocess(emptyToUndefined, z.string().optional()),
  minimumOrderAmount: z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().optional()),
  heroImageUrl: z.preprocess(emptyToUndefined, z.string().url().optional())
});

export const campaignCreateSchema = campaignSchema.refine(
  (data) => data.clientCompanyId || data.newClientCompanyName,
  "Selecciona una empresa mandante o crea una nueva."
);

export const campaignUpdateSchema = campaignSchema.extend({
  id: z.string().min(1)
});
