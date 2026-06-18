import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const buyerRegistrationSchema = z.object({
  companyName: z.string().min(3, "Ingresa el nombre de la empresa."),
  rut: z.string().min(6, "Ingresa el RUT de la empresa."),
  businessType: z.string().min(2, "Ingresa el giro o tipo de negocio."),
  tradeType: z.string().min(2, "Ingresa el tipo de comercio."),
  contactName: z.string().min(3, "Ingresa el nombre de contacto."),
  email: z.string().email("Ingresa un email valido."),
  phone: z.string().min(6, "Ingresa un telefono de contacto."),
  region: z.string().min(2, "Ingresa la region."),
  comuna: z.string().min(2, "Ingresa la comuna."),
  address: z.string().min(5, "Ingresa la direccion."),
  monthlyPurchaseEstimate: z.coerce.number().nonnegative(),
  categoriesOfInterest: z.array(z.string()).min(1, "Selecciona al menos una categoria."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  acceptedTerms: z.literal("on", {
    errorMap: () => ({ message: "Debes aceptar los terminos." })
  }),
  invitationToken: z.preprocess(emptyToUndefined, z.string().optional())
});

export const rejectBuyerSchema = z.object({
  buyerProfileId: z.string().min(1),
  rejectedReason: z.string().min(3, "Ingresa un motivo de rechazo.")
});

export const buyerProfileIdSchema = z.object({
  buyerProfileId: z.string().min(1)
});
