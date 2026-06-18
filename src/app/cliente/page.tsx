import Link from "next/link";

import { AccessBadge, AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function ClientPage() {
  const session = await requireRole(["CLIENT_ADMIN"]);

  const campaigns = await prisma.campaign.findMany({
    where: { clientCompanyId: session.user.companyId ?? "" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      eyebrow="Panel mandante"
      title="Cliente"
      description="Base protegida para ver campanas asociadas a tu empresa mandante."
      navItems={[
        { href: "/cliente/campanas", label: "Campanas" },
        { href: "/cliente/productos", label: "Productos" },
        { href: "/cliente/pedidos", label: "Pedidos" },
        { href: "/cliente/reportes", label: "Reportes" }
      ]}
    >
      <div className="space-y-6">
        <AccessBadge variant="client" />
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Campanas asociadas</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{campaigns.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Activas</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {campaigns.filter((campaign) => campaign.status === "active").length}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">En borrador/pausa</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              {campaigns.filter((campaign) => ["draft", "paused"].includes(campaign.status)).length}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ultimas campanas</CardTitle>
            <CardDescription>Solo campanas asociadas a tu empresa mandante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <div className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between" key={campaign.id}>
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={campaign.status} />
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/cliente/campanas/${campaign.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 ? <p className="text-sm text-muted-foreground">No hay campanas asociadas.</p> : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
