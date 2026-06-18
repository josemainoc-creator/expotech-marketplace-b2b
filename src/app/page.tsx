import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { roleHome } from "@/server/auth/roles";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(roleHome[session.user.role]);
  }

  return (
    <AppShell
      eyebrow="Venta privada mayorista por invitacion"
      title="Expotech Marketplace B2B"
      description="Plataforma privada para ventas mayoristas de oportunidad. El acceso esta limitado a compradores aprobados."
    >
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-md border bg-card p-6">
          <h2 className="text-2xl font-semibold">Acceso comercial privado</h2>
          <p className="mt-3 text-muted-foreground">
            Los productos, precios y stock referencial se habilitan solo para compradores B2B aprobados.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/solicitar-acceso">Solicitar acceso</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Ingresar</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Operacion MVP</CardTitle>
            <CardDescription>Pedidos comerciales sujetos a validacion del mandante.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>No hay pago online en el MVP.</p>
            <p>El mandante valida stock, factura, cobra y despacha.</p>
            <p>Expotech organiza la oferta y habilita el flujo comercial privado.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
