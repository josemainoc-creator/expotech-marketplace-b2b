import { AppShell } from "@/components/app-shell";
import { BuyerRegistrationForm } from "@/components/buyer-registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerBuyerAction } from "@/app/(auth)/registro/actions";
import { prisma } from "@/server/db/prisma";

type InvitationPageProps = {
  params: {
    token: string;
  };
};

export default async function InvitationPage({ params }: InvitationPageProps) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: params.token },
    include: {
      campaign: {
        select: {
          name: true,
          status: true
        }
      }
    }
  });

  if (!invitation || invitation.status === "cancelled") {
    return (
      <AppShell title="Invitacion no disponible" description="No pudimos encontrar una invitacion activa con ese token.">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">Solicita acceso para que el equipo revise tu empresa.</div>
      </AppShell>
    );
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "expired" }
    });

    return (
      <AppShell title="Invitacion expirada" description="La invitacion ya no esta vigente.">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">Solicita una nueva invitacion al equipo comercial.</div>
      </AppShell>
    );
  }

  if (invitation.status === "created" || invitation.status === "sent") {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "opened",
        openedAt: new Date()
      }
    });

    await prisma.activityLog.create({
      data: {
        campaignId: invitation.campaignId,
        action: "invitation_opened",
        entityType: "Invitation",
        entityId: invitation.id,
        metadata: { email: invitation.email }
      }
    });
  }

  return (
    <AppShell title="Invitacion privada" description={`Campana: ${invitation.campaign.name}`}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Completa tu registro B2B</CardTitle>
          <CardDescription>Tu invitacion precarga algunos datos, pero la aprobacion sigue sujeta a revision comercial.</CardDescription>
        </CardHeader>
        <CardContent>
          <BuyerRegistrationForm
            action={registerBuyerAction}
            invitationToken={params.token}
            defaults={{
              companyName: invitation.companyName,
              contactName: invitation.contactName,
              email: invitation.email,
              phone: invitation.phone
            }}
          />
        </CardContent>
      </Card>
    </AppShell>
  );
}
