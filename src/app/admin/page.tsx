import { AccessBadge, AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function AdminPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [totalCampaigns, activeCampaigns, totalClients, totalBuyers, pendingBuyers] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "active" } }),
    prisma.clientProfile.count(),
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.buyerProfile.count({ where: { approvalStatus: "pending" } })
  ]);

  const stats = [
    { label: "Total campanas", value: totalCampaigns },
    { label: "Campanas activas", value: activeCampaigns },
    { label: "Total mandantes", value: totalClients },
    { label: "Total compradores", value: totalBuyers },
    { label: "Compradores pendientes", value: pendingBuyers }
  ];

  return (
    <AppShell
      eyebrow="Panel Expotech"
      title="Administracion"
      description="Base protegida para operar campanas, productos, compradores e invitaciones."
      navItems={[
        { href: "/admin/campanas", label: "Campanas" },
        { href: "/admin/campanas/nueva", label: "Nueva campana" },
        { href: "/admin/productos", label: "Productos" },
        { href: "/admin/pedidos", label: "Pedidos" },
        { href: "/admin/compradores", label: "Compradores" },
        { href: "/admin/invitaciones", label: "Invitaciones" },
        { href: "/admin/reportes", label: "Reportes" }
      ]}
    >
      <div className="space-y-6">
        <AccessBadge variant="admin" />
        <div className="grid gap-4 md:grid-cols-5">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{item.value}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
