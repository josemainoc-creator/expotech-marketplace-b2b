import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CampaignLandingPageProps = {
  params: {
    slug: string;
  };
};

export default function CampaignLandingPage({ params }: CampaignLandingPageProps) {
  return (
    <AppShell
      eyebrow="Venta privada mayorista por invitacion"
      title="Campana privada Expotech"
      description="Los precios y productos estan disponibles solo para compradores aprobados."
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{params.slug}</CardTitle>
          <CardDescription>Landing publica inicial sin precios, stock ni datos sensibles del mandante.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/solicitar-acceso">Solicitar acceso</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Ingresar con invitacion</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
