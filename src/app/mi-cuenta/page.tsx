import { AccessBadge, AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { getCurrentUser, requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function MyAccountPage() {
  await requireRole(["BUYER"]);
  const user = await getCurrentUser();
  const leadStatuses = user?.companyId
    ? await prisma.leadStatus.findMany({
        where: { companyId: user.companyId },
        include: {
          campaign: {
            select: {
              name: true,
              status: true
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      })
    : [];

  return (
    <AppShell
      eyebrow="Cuenta comprador"
      title="Mi cuenta"
      description="Perfil del comprador B2B y estado de aprobacion para acceso al catalogo privado."
    >
      <div className="space-y-6">
        <AccessBadge variant="buyer" />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>{user?.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Empresa</span>
              <span>{user?.company?.name ?? "Sin empresa"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estado usuario</span>
              {user?.status ? <StatusBadge status={user.status} /> : null}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Aprobacion comprador</span>
              {user?.buyerProfile?.approvalStatus ? <StatusBadge status={user.buyerProfile.approvalStatus} /> : null}
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Tipo de comercio</span>
              <span>{user?.buyerProfile?.businessType ?? "No informado"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Compra estimada</span>
              <span>{formatMoney(user?.buyerProfile?.monthlyPurchaseEstimate)}</span>
            </div>
            <div className="space-y-2">
              <span className="text-muted-foreground">Categorias de interes</span>
              <p>{user?.buyerProfile?.categoriesOfInterest.join(", ") || "No informadas"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Solicitudes y campanas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {leadStatuses.map((lead) => (
              <div className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between" key={lead.id}>
                <div>
                  <div className="font-medium">{lead.campaign.name}</div>
                  <div className="text-muted-foreground">{lead.source ?? "Origen no informado"}</div>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
            {leadStatuses.length === 0 ? (
              <p className="text-muted-foreground">Tu solicitud fue recibida. Aun no hay campanas asociadas a tu empresa.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
