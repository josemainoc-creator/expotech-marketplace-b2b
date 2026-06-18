import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ClearCartOnLoad } from "@/components/clear-cart-on-load";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type OrderConfirmedPageProps = {
  searchParams?: {
    orderId?: string;
  };
};

export default async function OrderConfirmedPage({ searchParams }: OrderConfirmedPageProps) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);

  if (!searchParams?.orderId) {
    redirect("/mis-pedidos");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: searchParams.orderId,
      buyerUserId: session.user.id
    },
    include: {
      campaign: { select: { name: true } },
      items: true
    }
  });

  if (!order) {
    redirect("/mis-pedidos");
  }

  return (
    <AppShell title="Pedido recibido" description="Solicitud registrada para revision comercial.">
      <ClearCartOnLoad />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Hemos recibido tu solicitud de pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            El equipo comercial validara stock, condiciones de pago y despacho antes de confirmar la venta.
          </p>
          <div className="rounded-md border p-4">
            <div className="font-medium">Pedido {order.id}</div>
            <div className="text-muted-foreground">Campana: {order.campaign.name}</div>
            <div className="text-muted-foreground">Total solicitado: {formatMoney(order.subtotal)}</div>
            <div className="text-muted-foreground">Items: {order.items.length}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/mis-pedidos/${order.id}`}>Ver detalle</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/catalogo">Volver al catalogo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
