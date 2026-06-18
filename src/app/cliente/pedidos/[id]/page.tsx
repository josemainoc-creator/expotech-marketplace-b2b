import { notFound } from "next/navigation";

import { OrderStatusForm } from "@/components/order-status-form";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrderStatusAction } from "@/app/admin/pedidos/actions";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type ClientOrderPageProps = {
  params: {
    id: string;
  };
};

export default async function ClientOrderPage({ params }: ClientOrderPageProps) {
  const session = await requireRole(["CLIENT_ADMIN"]);

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      campaign: { clientCompanyId: session.user.companyId ?? "" }
    },
    include: {
      campaign: { select: { name: true } },
      buyerCompany: true,
      buyerUser: { select: { name: true, email: true, phone: true } },
      items: true
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <AppShell title={`Pedido ${order.id}`} description="Solicitud comercial asociada a tu campana.">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div className="grid gap-2 rounded-md border p-3 text-sm md:grid-cols-[1fr_auto]" key={item.id}>
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-muted-foreground">SKU {item.sku} · Cantidad {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div>{formatMoney(item.unitPrice)}</div>
                  <div className="font-medium">{formatMoney(item.lineTotal)}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <p className="text-muted-foreground">Comprador: {order.buyerCompany.name}</p>
              <p className="text-muted-foreground">Contacto: {order.buyerUser.name} · {order.buyerUser.email}</p>
            </CardContent>
          </Card>
          <OrderStatusForm orderId={order.id} status={order.status} adminNotes={order.adminNotes} action={updateOrderStatusAction} />
        </div>
      </div>
    </AppShell>
  );
}
