import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const clientCompanySchema = z.object({
  name: z.string().min(3, "La empresa debe tener al menos 3 caracteres."),
  rut: z.preprocess(emptyToUndefined, z.string().optional()),
  businessType: z.preprocess(emptyToUndefined, z.string().optional()),
  contactName: z.preprocess(emptyToUndefined, z.string().optional()),
  email: z.preprocess(emptyToUndefined, z.string().email().optional()),
  phone: z.preprocess(emptyToUndefined, z.string().optional()),
  region: z.preprocess(emptyToUndefined, z.string().optional()),
  comuna: z.preprocess(emptyToUndefined, z.string().optional()),
  address: z.preprocess(emptyToUndefined, z.string().optional()),
  website: z.preprocess(emptyToUndefined, z.string().url().optional())
});
