import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function MyOrdersPage() {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);

  const orders = await prisma.order.findMany({
    where: { buyerUserId: session.user.id },
    include: {
      campaign: { select: { name: true } },
      items: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Mis pedidos"
      description="Historial de solicitudes comerciales enviadas."
      navItems={[
        { href: "/catalogo", label: "Catalogo" },
        { href: "/carrito", label: "Carrito" }
      ]}
    >
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Campana</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr className="border-b last:border-0" key={order.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.id}</div>
                      <div className="text-xs text-muted-foreground">{order.items.length} items</div>
                    </td>
                    <td className="px-4 py-3">{order.campaign.name}</td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">{formatMoney(order.subtotal)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/mis-pedidos/${order.id}`}>Ver</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      Aun no tienes solicitudes de pedido.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
