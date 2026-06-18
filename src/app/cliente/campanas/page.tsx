import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function ClientCampaignsPage() {
  const session = await requireRole(["CLIENT_ADMIN"]);

  const campaigns = await prisma.campaign.findMany({
    where: { clientCompanyId: session.user.companyId ?? "" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Mis campanas"
      description="Campanas asociadas a tu empresa mandante."
      navItems={[{ href: "/cliente", label: "Panel" }]}
    >
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Campana</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Inicio</th>
                  <th className="px-4 py-3 font-medium">Termino</th>
                  <th className="px-4 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr className="border-b last:border-0" key={campaign.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">{campaign.shortDescription ?? campaign.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(campaign.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(campaign.endDate)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/cliente/campanas/${campaign.id}`}>Ver detalle</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      No hay campanas asociadas a tu empresa.
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
