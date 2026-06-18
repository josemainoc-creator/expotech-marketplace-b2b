import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { createInvitationAction } from "@/app/admin/invitaciones/actions";

export default async function AdminInvitationsPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [campaigns, invitations] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: { in: ["draft", "active", "paused"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.invitation.findMany({
      include: {
        campaign: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <AppShell
      title="Invitaciones"
      description="Crea tokens privados para registro de compradores B2B."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/compradores", label: "Compradores" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nueva invitacion</CardTitle>
            <CardDescription>No se envia email en esta etapa; copia el enlace generado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createInvitationAction} className="space-y-4">
              <label className="space-y-2 text-sm font-medium">
                Campana
                <select name="campaignId" className="h-10 w-full rounded-md border px-3 text-sm" required>
                  <option value="">Seleccionar campana</option>
                  {campaigns.map((campaign) => (
                    <option value={campaign.id} key={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium">
                Email
                <input name="email" type="email" className="h-10 w-full rounded-md border px-3 text-sm" required />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Empresa
                <input name="companyName" className="h-10 w-full rounded-md border px-3 text-sm" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Contacto
                <input name="contactName" className="h-10 w-full rounded-md border px-3 text-sm" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Telefono
                <input name="phone" className="h-10 w-full rounded-md border px-3 text-sm" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Expira
                <input name="expiresAt" type="date" className="h-10 w-full rounded-md border px-3 text-sm" />
              </label>
              <Button type="submit">Crear invitacion</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitaciones creadas</CardTitle>
            <CardDescription>Comparte manualmente el enlace privado con el comprador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invitation) => (
              <div className="rounded-md border p-4" key={invitation.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">{invitation.companyName ?? "Empresa no informada"}</div>
                    <div className="text-sm text-muted-foreground">{invitation.campaign.name}</div>
                    <div className="mt-2 text-xs text-muted-foreground">Expira: {formatDate(invitation.expiresAt)}</div>
                  </div>
                  <StatusBadge status={invitation.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="rounded-md bg-muted px-2 py-1 text-xs">/invitacion/{invitation.token}</code>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/invitacion/${invitation.token}`}>Abrir</Link>
                  </Button>
                </div>
              </div>
            ))}
            {invitations.length === 0 ? <p className="text-sm text-muted-foreground">No hay invitaciones creadas.</p> : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
