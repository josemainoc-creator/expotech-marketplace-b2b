import { AppShell } from "@/components/app-shell";
import { CampaignForm } from "@/components/campaign-form";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { createCampaignAction } from "@/app/admin/campanas/actions";

export default async function NewCampaignPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const companies = await prisma.company.findMany({
    where: {
      OR: [{ clientProfile: { isNot: null } }, { businessType: { contains: "Mandante", mode: "insensitive" } }]
    },
    select: { id: true, name: true, rut: true },
    orderBy: { name: "asc" }
  });

  return (
    <AppShell
      title="Nueva campana"
      description="Crea una venta privada y asociala a una empresa mandante."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/campanas", label: "Campanas" }
      ]}
    >
      <div className="rounded-md border bg-card p-6">
        <CampaignForm action={createCampaignAction} companies={companies} />
      </div>
    </AppShell>
  );
}
