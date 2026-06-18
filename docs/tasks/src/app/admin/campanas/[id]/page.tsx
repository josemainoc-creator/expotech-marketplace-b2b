import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { CampaignForm } from "@/components/campaign-form";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { updateCampaignAction } from "@/app/admin/campanas/actions";

type AdminCampaignPageProps = {
  params: {
    id: string;
  };
};

export default async function AdminCampaignPage({ params }: AdminCampaignPageProps) {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [campaign, companies] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        clientCompany: true
      }
    }),
    prisma.company.findMany({
      where: {
        OR: [{ clientProfile: { isNot: null } }, { businessType: { contains: "Mandante", mode: "insensitive" } }]
      },
      select: { id: true, name: true, rut: true },
      orderBy: { name: "asc" }
    })
  ]);

  if (!campaign) {
    notFound();
  }

  return (
    <AppShell
      title={campaign.name}
      description="Detalle y edicion basica de campana."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/campanas", label: "Campanas" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estado</span>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Mandante</span>
              <span className="font-medium">{campaign.clientCompany.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Inicio</span>
              <span>{formatDate(campaign.startDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Termino</span>
              <span>{formatDate(campaign.endDate)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Minimo</span>
              <span>{formatMoney(campaign.minimumOrderAmount)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-md border bg-card p-6">
          <CampaignForm action={updateCampaignAction} companies={companies} campaign={campaign} />
        </div>
      </div>
    </AppShell>
  );
}
