import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function ClientOrdersPage() {
  const session = await requireRole(["CLIENT_ADMIN"]);

  const orders = await prisma.order.findMany({
    where: {
      campaign: { clientCompanyId: session.user.companyId ?? "" }
    },
    include: {
      campaign: { select: { name: true } },
      buyerCompany: { select: { name: true, rut: true } },
      items: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Pedidos"
      description="Solicitudes asociadas a tus campanas."
      navItems={[
        { href: "/cliente", label: "Panel" },
        { href: "/cliente/productos", label: "Productos" }
      ]}
    >
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Comprador</th>
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
                    <td className="px-4 py-3">{order.buyerCompany.name}</td>
                    <td className="px-4 py-3">{order.campaign.name}</td>
                    <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">{formatMoney(order.subtotal)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/cliente/pedidos/${order.id}`}>Ver</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      No hay pedidos para tus campanas.
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
