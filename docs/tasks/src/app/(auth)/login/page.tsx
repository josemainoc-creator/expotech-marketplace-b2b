import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "@/app/(auth)/login/actions";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AppShell title="Ingreso" description="Acceso para administradores, mandantes y compradores aprobados.">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription>Usa una cuenta demo del seed o una cuenta creada en la base de datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {searchParams?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              No pudimos iniciar sesion con esas credenciales.
            </div>
          ) : null}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input id="email" name="email" className="h-10 w-full rounded-md border px-3 text-sm" type="email" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                className="h-10 w-full rounded-md border px-3 text-sm"
                type="password"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Ingresar
            </Button>
          </form>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/solicitar-acceso">Solicitar acceso B2B</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
