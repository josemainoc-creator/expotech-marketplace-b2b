import { AppShell } from "@/components/app-shell";
import { BuyerRegistrationForm } from "@/components/buyer-registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerBuyerAction } from "@/app/(auth)/registro/actions";

type SolicitarAccesoPageProps = {
  searchParams?: {
    estado?: string;
  };
};

export default function SolicitarAccesoPage({ searchParams }: SolicitarAccesoPageProps) {
  return (
    <AppShell title="Solicitar acceso" description="Los precios y productos estan disponibles solo para compradores aprobados.">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Acceso mayorista</CardTitle>
          <CardDescription>Recibiremos tu solicitud y el equipo comercial revisara tu perfil B2B.</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.estado === "recibida" ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Solicitud recibida. Te avisaremos cuando tu comprador sea aprobado.
            </div>
          ) : null}
          <BuyerRegistrationForm action={registerBuyerAction} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
