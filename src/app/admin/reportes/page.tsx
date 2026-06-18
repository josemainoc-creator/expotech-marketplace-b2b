import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function AdminReportsPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [orders, buyersCount, pendingBuyers, emailLogs] = await Promise.all([
    prisma.order.findMany({ select: { status: true, subtotal: true } }),
    prisma.buyerProfile.count(),
    prisma.buyerProfile.count({ where: { approvalStatus: "pending" } }),
    prisma.emailLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 8
    })
  ]);
  const total = orders.reduce((sum, order) => sum + Number(order.subtotal.toString()), 0);
  const byStatus = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell
      title="Reporte operativo"
      description="Vista simple de pedidos, compradores y emails operativos."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/pedidos", label: "Pedidos" }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{orders.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Monto solicitado</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{formatMoney(total)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Compradores</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{buyersCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{pendingBuyers}</CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {Object.entries(byStatus).map(([status, count]) => (
              <div className="flex justify-between rounded-md border px-3 py-2" key={status}>
                <span>{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exportaciones</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {["pedidos", "items", "compradores"].map((type) => (
              <div className="rounded-md border p-3" key={type}>
                <div className="mb-2 text-sm font-medium">{type}</div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`/admin/export/${type}?format=csv`}>CSV</a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={`/admin/export/${type}?format=xlsx`}>XLSX</a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>EmailLog reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {emailLogs.map((log) => (
            <div className="grid gap-2 rounded-md border px-3 py-2 md:grid-cols-[1fr_1fr_auto]" key={log.id}>
              <span>{log.templateName}</span>
              <span className="text-muted-foreground">{log.recipientEmail}</span>
              <span>{log.status}</span>
            </div>
          ))}
          {emailLogs.length === 0 ? <p className="text-muted-foreground">Aun no hay emails registrados.</p> : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
