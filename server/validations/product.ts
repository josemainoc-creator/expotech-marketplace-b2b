import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const productSchema = z.object({
  campaignId: z.string().min(1),
  sku: z.string().min(1),
  name: z.string().min(2),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  newCategoryName: z.preprocess(emptyToUndefined, z.string().optional()),
  brand: z.preprocess(emptyToUndefined, z.string().optional()),
  description: z.preprocess(emptyToUndefined, z.string().optional()),
  regularPrice: z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().optional()),
  liquidationPrice: z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().optional()),
  wholesalePrice: z.coerce.number().positive(),
  minOrderQty: z.coerce.number().int().positive(),
  unitType: z.string().min(1),
  unitsPerBox: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  availableStock: z.coerce.number().int().nonnegative(),
  expirationDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
  status: z.enum(["draft", "active", "inactive", "out_of_stock"]).default("draft"),
  featured: z.preprocess((value) => value === "on" || value === true, z.boolean()).default(false),
  imageUrl: z.preprocess(emptyToUndefined, z.string().url().optional())
});

export const productCreateSchema = productSchema.refine(
  (data) => data.categoryId || data.newCategoryName,
  "Selecciona una categoria o crea una nueva."
);

export const productUpdateSchema = productSchema
  .extend({
    id: z.string().min(1)
  })
  .refine((data) => data.categoryId || data.newCategoryName, "Selecciona una categoria o crea una nueva.");

export const csvProductRowSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  brand: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  regularPrice: z.coerce.number().nonnegative().optional(),
  wholesalePrice: z.coerce.number().positive(),
  minOrderQty: z.coerce.number().int().positive(),
  unitType: z.string().min(1),
  unitsPerBox: z.coerce.number().int().positive().optional(),
  availableStock: z.coerce.number().int().nonnegative(),
  expirationDate: z.preprocess(emptyToUndefined, z.coerce.date().optional())
});

export const productImportSchema = z.object({
  campaignId: z.string().min(1),
  csvText: z.string().min(1)
});
