import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive()
});

export const submitOrderSchema = z.object({
  cartJson: z.string().min(1),
  notes: z.string().optional(),
  paymentConditionRequested: z.string().optional(),
  deliveryMethodRequested: z.string().optional()
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["submitted", "under_review", "approved", "rejected", "fulfilled", "cancelled"]),
  adminNotes: z.string().optional()
});
