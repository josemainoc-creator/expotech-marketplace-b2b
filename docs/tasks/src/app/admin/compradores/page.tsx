import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { approveBuyerAction, rejectBuyerAction } from "@/app/admin/compradores/actions";

export default async function AdminBuyersPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const buyers = await prisma.buyerProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          status: true
        }
      },
      company: {
        select: {
          name: true,
          rut: true,
          businessType: true,
          region: true,
          comuna: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Compradores"
      description="Aprueba o rechaza solicitudes de compradores B2B."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/invitaciones", label: "Invitaciones" }
      ]}
    >
      <Card>
        <CardContent className="space-y-4 p-6">
          {buyers.map((buyer) => (
            <div className="rounded-md border p-4" key={buyer.id}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold">{buyer.company.name}</h2>
                    <StatusBadge status={buyer.approvalStatus} />
                    <StatusBadge status={buyer.company.status} />
                  </div>
                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p>Contacto: {buyer.user.name}</p>
                    <p>Email: {buyer.user.email}</p>
                    <p>Telefono: {buyer.user.phone ?? "Sin telefono"}</p>
                    <p>RUT: {buyer.company.rut ?? "Sin RUT"}</p>
                    <p>Giro: {buyer.company.businessType ?? buyer.businessType ?? "No informado"}</p>
                    <p>
                      Ubicacion: {buyer.company.region ?? "Region no informada"} / {buyer.company.comuna ?? "Comuna no informada"}
                    </p>
                    <p>Compra estimada: {formatMoney(buyer.monthlyPurchaseEstimate)}</p>
                    <p>Categorias: {buyer.categoriesOfInterest.join(", ") || "No informadas"}</p>
                  </div>
                  {buyer.rejectedReason ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      Motivo rechazo: {buyer.rejectedReason}
                    </p>
                  ) : null}
                </div>
                <div className="flex min-w-64 flex-col gap-3">
                  <form action={approveBuyerAction}>
                    <input type="hidden" name="buyerProfileId" value={buyer.id} />
                    <Button className="w-full" type="submit" disabled={buyer.approvalStatus === "approved"}>
                      Aprobar
                    </Button>
                  </form>
                  <form action={rejectBuyerAction} className="space-y-2">
                    <input type="hidden" name="buyerProfileId" value={buyer.id} />
                    <input
                      name="rejectedReason"
                      className="h-10 w-full rounded-md border px-3 text-sm"
                      placeholder="Motivo de rechazo"
                      required
                    />
                    <Button className="w-full" type="submit" variant="destructive" disabled={buyer.approvalStatus === "rejected"}>
                      Rechazar
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {buyers.length === 0 ? <p className="text-sm text-muted-foreground">No hay compradores registrados.</p> : null}
        </CardContent>
      </Card>
    </AppShell>
  );
}
