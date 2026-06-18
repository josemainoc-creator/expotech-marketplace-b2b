import { AppShell } from "@/components/app-shell";
import { BuyerRegistrationForm } from "@/components/buyer-registration-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerBuyerAction } from "@/app/(auth)/registro/actions";

type RegistroPageProps = {
  searchParams?: {
    estado?: string;
    token?: string;
  };
};

export default function RegistroPage({ searchParams }: RegistroPageProps) {
  return (
    <AppShell title="Registro comprador B2B" description="Formulario base para empresas interesadas en ventas privadas.">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Solicitud de registro</CardTitle>
          <CardDescription>Completa los datos de tu empresa para solicitar aprobacion como comprador mayorista.</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.estado === "email-existente" ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Ya existe una cuenta con ese email. Intenta ingresar o usa otro correo.
            </div>
          ) : null}
          {searchParams?.estado === "rut-existente" ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Ya existe una empresa con ese RUT. Contacta al equipo comercial si necesitas actualizar los datos.
            </div>
          ) : null}
          {searchParams?.estado === "invitacion-invalida" ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              La invitacion no existe, fue cancelada o ya expiro.
            </div>
          ) : null}
          <BuyerRegistrationForm action={registerBuyerAction} invitationToken={searchParams?.token} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
