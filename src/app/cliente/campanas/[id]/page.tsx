import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { assertClientOwnsCampaign, requireRole } from "@/server/auth/access";

type ClientCampaignPageProps = {
  params: {
    id: string;
  };
};

export default async function ClientCampaignPage({ params }: ClientCampaignPageProps) {
  const session = await requireRole(["CLIENT_ADMIN"]);
  const campaign = await assertClientOwnsCampaign(params.id, session.user);

  return (
    <AppShell
      title={campaign.name}
      description={campaign.shortDescription ?? "Detalle de campana asociada a tu empresa."}
      navItems={[
        { href: "/cliente", label: "Panel" },
        { href: "/cliente/campanas", label: "Campanas" }
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos comerciales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estado</span>
              <StatusBadge status={campaign.status} />
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
        <Card>
          <CardHeader>
            <CardTitle>Mandante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">{campaign.clientCompany.name}</p>
            <p className="text-muted-foreground">{campaign.clientCompany.rut ?? "Sin RUT registrado"}</p>
            <p className="text-muted-foreground">{campaign.clientCompany.email ?? "Sin email registrado"}</p>
            <p className="text-muted-foreground">{campaign.clientCompany.phone ?? "Sin telefono registrado"}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
