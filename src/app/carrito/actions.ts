"use server";

import { redirect } from "next/navigation";

import { logActivity } from "@/server/activity";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { sendOrderSubmittedEmails } from "@/server/order-emails";
import { cartItemSchema, submitOrderSchema } from "@/server/validations/order";

function emptyToNull(value?: string) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function submitOrderAction(formData: FormData) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);

  const buyerCompanyId = session.user.companyId;

if (!buyerCompanyId) {
  redirect("/carrito?error=empresa");
}

  const parsed = submitOrderSchema.parse(Object.fromEntries(formData));
  const cartItems = cartItemSchema.array().parse(JSON.parse(parsed.cartJson));

  if (cartItems.length === 0) {
    redirect("/carrito?error=vacio");
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: cartItems.map((item) => item.productId) },
      status: "active",
      campaign: { status: "active" }
    },
    include: {
      campaign: { select: { id: true, minimumOrderAmount: true } }
    }
  });

  if (products.length !== cartItems.length) {
    redirect("/carrito?error=productos");
  }

  const campaignIds = new Set(products.map((product) => product.campaignId));

  if (campaignIds.size !== 1) {
    redirect("/carrito?error=campana");
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  let subtotal = 0;

  for (const item of cartItems) {
    const product = productById.get(item.productId);

    if (!product) {
      redirect("/carrito?error=productos");
    }

    if (item.quantity < product.minOrderQty) {
      redirect(`/carrito?error=minimo&sku=${encodeURIComponent(product.sku)}`);
    }

    if (item.quantity > product.availableStock) {
      redirect(`/carrito?error=stock&sku=${encodeURIComponent(product.sku)}`);
    }

    subtotal += item.quantity * Number(product.wholesalePrice.toString());
  }

  const campaign = products[0].campaign;
  const minimumOrderAmount = Number(campaign.minimumOrderAmount?.toString() ?? 0);

  if (minimumOrderAmount > 0 && subtotal < minimumOrderAmount) {
    redirect("/carrito?error=minimo-campana");
  }

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        campaignId: products[0].campaignId,
        buyerCompanyId,
        buyerUserId: session.user.id,
        status: "submitted",
        subtotal,
        notes: emptyToNull(parsed.notes),
        paymentConditionRequested: emptyToNull(parsed.paymentConditionRequested),
        deliveryMethodRequested: emptyToNull(parsed.deliveryMethodRequested),
        items: {
          create: cartItems.map((item) => {
            const product = productById.get(item.productId)!;
            const unitPrice = Number(product.wholesalePrice.toString());

            return {
              productId: product.id,
              sku: product.sku,
              productName: product.name,
              quantity: item.quantity,
              unitPrice,
              lineTotal: item.quantity * unitPrice
            };
          })
        }
      },
      select: { id: true, campaignId: true }
    });

    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        campaignId: createdOrder.campaignId,
        action: "order_submitted",
        entityType: "Order",
        entityId: createdOrder.id,
        metadata: {
          subtotal,
          itemCount: cartItems.length
        }
      }
    });

    return createdOrder;
  });

  await logActivity({
    userId: session.user.id,
    campaignId: order.campaignId,
    action: "cart_converted_to_order",
    entityType: "Order",
    entityId: order.id
  });

  try {
    await sendOrderSubmittedEmails(order.id);
  } catch (error) {
    console.error("order_submitted_email_failed", error);
  }

  redirect(`/pedido-confirmado?orderId=${order.id}`);
}
