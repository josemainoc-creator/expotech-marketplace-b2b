import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type MyOrderPageProps = {
  params: {
    id: string;
  };
};

export default async function MyOrderPage({ params }: MyOrderPageProps) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      buyerUserId: session.user.id
    },
    include: {
      campaign: { select: { name: true } },
      items: true
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <AppShell title={`Pedido ${order.id}`} description="Detalle de solicitud sujeta a validacion comercial.">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Productos solicitados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div className="grid gap-2 rounded-md border p-3 text-sm md:grid-cols-[1fr_auto]" key={item.id}>
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-muted-foreground">SKU {item.sku}</div>
                  <div className="text-muted-foreground">Cantidad: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div>{formatMoney(item.unitPrice)}</div>
                  <div className="font-medium">{formatMoney(item.lineTotal)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estado</span>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Campana</span>
              <span>{order.campaign.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatMoney(order.subtotal)}</span>
            </div>
            {order.notes ? <p className="rounded-md border p-3 text-muted-foreground">{order.notes}</p> : null}
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
              Sujeto a validacion de stock y condiciones comerciales.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
