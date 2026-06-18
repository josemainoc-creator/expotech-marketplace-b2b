import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function AdminCampaignsPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const campaigns = await prisma.campaign.findMany({
    include: {
      clientCompany: {
        select: {
          name: true,
          rut: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Campanas"
      description="Gestion de ventas privadas asociadas a empresas mandantes."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/campanas/nueva", label: "Nueva campana" }
      ]}
    >
      <div className="mb-6">
        <Button asChild>
          <Link href="/admin/campanas/nueva">Crear campana</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Campana</th>
                  <th className="px-4 py-3 font-medium">Mandante</th>
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
                      <div className="text-xs text-muted-foreground">{campaign.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{campaign.clientCompany.name}</div>
                      <div className="text-xs text-muted-foreground">{campaign.clientCompany.rut ?? "Sin RUT"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(campaign.startDate)}</td>
                    <td className="px-4 py-3">{formatDate(campaign.endDate)}</td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/campanas/${campaign.id}`}>Ver detalle</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No hay campanas creadas.
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
