import type { OrderStatus } from "@prisma/client";

import { formatMoney } from "@/lib/format";
import { prisma } from "@/server/db/prisma";
import { sendTransactionalEmail } from "@/server/email";

function orderUrl(orderId: string) {
  const baseUrl = process.env.APP_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${baseUrl}/mis-pedidos/${orderId}`;
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    draft: "borrador",
    submitted: "recibido",
    under_review: "en revision",
    approved: "aprobado",
    rejected: "rechazado",
    fulfilled: "completado",
    cancelled: "cancelado"
  };

  return labels[status];
}

export async function sendOrderSubmittedEmails(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      campaign: {
        include: {
          clientCompany: {
            include: {
              clientProfile: true
            }
          }
        }
      },
      buyerCompany: true,
      buyerUser: true,
      items: true
    }
  });

  if (!order) {
    return;
  }

  const html = `
    <h1>Solicitud de pedido recibida</h1>
    <p>Pedido: ${order.id}</p>
    <p>Campana: ${order.campaign.name}</p>
    <p>Total solicitado: ${formatMoney(order.subtotal)}</p>
    <p>Este pedido esta sujeto a validacion de stock y condiciones comerciales.</p>
    <p><a href="${orderUrl(order.id)}">Ver pedido</a></p>
  `;

  await Promise.all([
    sendTransactionalEmail({
      campaignId: order.campaignId,
      recipientEmail: order.buyerUser.email,
      subject: "Recibimos tu solicitud de pedido",
      templateName: "order_received_buyer",
      html,
      metadata: { orderId: order.id }
    }),
    process.env.EXPOTECH_INTERNAL_EMAIL
      ? sendTransactionalEmail({
          campaignId: order.campaignId,
          recipientEmail: process.env.EXPOTECH_INTERNAL_EMAIL,
          subject: "Nuevo pedido recibido",
          templateName: "order_received_internal",
          html: `
            <h1>Nuevo pedido recibido</h1>
            <p>Pedido: ${order.id}</p>
            <p>Comprador: ${order.buyerCompany.name}</p>
            <p>Campana: ${order.campaign.name}</p>
            <p>Total: ${formatMoney(order.subtotal)}</p>
          `,
          metadata: { orderId: order.id }
        })
      : Promise.resolve(),
    order.campaign.clientCompany.clientProfile?.commercialContactEmail
      ? sendTransactionalEmail({
          campaignId: order.campaignId,
          recipientEmail: order.campaign.clientCompany.clientProfile.commercialContactEmail,
          subject: "Nuevo pedido para tu campana",
          templateName: "order_received_client",
          html: `
            <h1>Nuevo pedido para ${order.campaign.name}</h1>
            <p>Comprador: ${order.buyerCompany.name}</p>
            <p>Total solicitado: ${formatMoney(order.subtotal)}</p>
            <p>Sujeto a validacion comercial.</p>
          `,
          metadata: { orderId: order.id }
        })
      : Promise.resolve()
  ]);
}

export async function sendOrderStatusEmail(orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      campaign: true,
      buyerUser: true
    }
  });

  if (!order || !["under_review", "approved", "rejected", "fulfilled", "cancelled"].includes(status)) {
    return;
  }

  await sendTransactionalEmail({
    campaignId: order.campaignId,
    recipientEmail: order.buyerUser.email,
    subject: `Tu pedido fue actualizado: ${statusLabel(status)}`,
    templateName: "order_status_updated_buyer",
    html: `
      <h1>Actualizacion de pedido</h1>
      <p>Pedido: ${order.id}</p>
      <p>Campana: ${order.campaign.name}</p>
      <p>Estado: ${statusLabel(status)}</p>
      <p>Este pedido sigue sujeto a las condiciones comerciales acordadas.</p>
      <p><a href="${orderUrl(order.id)}">Ver pedido</a></p>
    `,
    metadata: { orderId: order.id, status }
  });
}
