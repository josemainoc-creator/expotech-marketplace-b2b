import { AppShell } from "@/components/app-shell";
import { ProductForm } from "@/components/product-form";
import { createProductAction } from "@/app/admin/productos/actions";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function NewProductPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const [campaigns, categories] = await Promise.all([
    prisma.campaign.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.productCategory.findMany({
      select: { id: true, name: true, campaignId: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <AppShell
      title="Nuevo producto"
      description="Carga manual de producto asociado a una campana."
      navItems={[
        { href: "/admin/productos", label: "Productos" },
        { href: "/admin/productos/importar", label: "Importar CSV" }
      ]}
    >
      <div className="rounded-md border bg-card p-6">
        <ProductForm action={createProductAction} campaigns={campaigns} categories={categories} />
      </div>
    </AppShell>
  );
}
