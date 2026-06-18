import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProductAction } from "@/app/admin/productos/actions";
import { formatDate, formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type AdminProductPageProps = {
  params: {
    id: string;
  };
};

export default async function AdminProductPage({ params }: AdminProductPageProps) {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [product, campaigns, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        campaign: { select: { name: true } },
        category: { select: { name: true } }
      }
    }),
    prisma.campaign.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.productCategory.findMany({
      select: { id: true, name: true, campaignId: true },
      orderBy: { name: "asc" }
    })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AppShell
      title={product.name}
      description="Editar producto y condiciones comerciales visibles para compradores aprobados."
      navItems={[
        { href: "/admin/productos", label: "Productos" },
        { href: "/admin/productos/importar", label: "Importar CSV" }
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estado</span>
              <StatusBadge status={product.status} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Campana</span>
              <span className="font-medium">{product.campaign.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Categoria</span>
              <span>{product.category?.name ?? "Sin categoria"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Precio mayorista</span>
              <span>{formatMoney(product.wholesalePrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Stock</span>
              <span>{product.availableStock}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Vencimiento</span>
              <span>{formatDate(product.expirationDate)}</span>
            </div>
          </CardContent>
        </Card>
        <div className="rounded-md border bg-card p-6">
          <ProductForm action={updateProductAction} campaigns={campaigns} categories={categories} product={product} />
        </div>
      </div>
    </AppShell>
  );
}
