import { AppShell } from "@/components/app-shell";
import { CsvImportForm } from "@/components/csv-import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { importProductsAction } from "@/app/admin/productos/actions";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type ImportProductsPageProps = {
  searchParams?: {
    estado?: string;
    cantidad?: string;
  };
};

export default async function ImportProductsPage({ searchParams }: ImportProductsPageProps) {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const campaigns = await prisma.campaign.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <AppShell
      title="Importar productos"
      description="Importacion CSV con preview antes de guardar."
      navItems={[
        { href: "/admin/productos", label: "Productos" },
        { href: "/admin/productos/nuevo", label: "Nuevo producto" }
      ]}
    >
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>CSV de productos</CardTitle>
          <CardDescription>
            Columnas requeridas: sku,name,brand,category,description,regularPrice,wholesalePrice,minOrderQty,unitType,unitsPerBox,availableStock,expirationDate
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams?.estado === "importado" ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Importacion completada: {searchParams.cantidad ?? "0"} productos procesados.
            </div>
          ) : null}
          <CsvImportForm action={importProductsAction} campaigns={campaigns} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
