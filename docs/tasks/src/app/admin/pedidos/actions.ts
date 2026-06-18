"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/server/activity";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { sendOrderStatusEmail } from "@/server/order-emails";
import { orderStatusSchema } from "@/server/validations/order";

export async function updateOrderStatusAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH", "CLIENT_ADMIN"]);
  const parsed = orderStatusSchema.parse(Object.fromEntries(formData));

  const order = await prisma.order.findUnique({
    where: { id: parsed.orderId },
    include: { campaign: { select: { clientCompanyId: true } } }
  });

  if (!order) {
    return;
  }

  if (session.user.role === "CLIENT_ADMIN" && session.user.companyId !== order.campaign.clientCompanyId) {
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: parsed.status,
      adminNotes: parsed.adminNotes
    }
  });

  await logActivity({
    userId: session.user.id,
    campaignId: order.campaignId,
    action: "order_status_updated",
    entityType: "Order",
    entityId: order.id,
    metadata: { status: parsed.status }
  });

  try {
    await sendOrderStatusEmail(order.id, parsed.status);
  } catch (error) {
    console.error("order_status_email_failed", error);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${order.id}`);
  revalidatePath("/cliente/pedidos");
  revalidatePath(`/cliente/pedidos/${order.id}`);
}
