import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function AdminProductsPage() {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const products = await prisma.product.findMany({
    include: {
      campaign: {
        select: {
          name: true,
          clientCompany: {
            select: { name: true }
          }
        }
      },
      category: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Productos"
      description="Carga manual, edicion e importacion de productos por campana."
      navItems={[
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/productos/nuevo", label: "Nuevo producto" },
        { href: "/admin/productos/importar", label: "Importar CSV" }
      ]}
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/productos/nuevo">Crear producto</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/productos/importar">Importar CSV</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Campana</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Accion</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="border-b last:border-0" key={product.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku} - {product.brand ?? "Sin marca"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{product.campaign.name}</div>
                      <div className="text-xs text-muted-foreground">{product.campaign.clientCompany.name}</div>
                    </td>
                    <td className="px-4 py-3">{product.category?.name ?? "Sin categoria"}</td>
                    <td className="px-4 py-3">{formatMoney(product.wholesalePrice)}</td>
                    <td className="px-4 py-3">{product.availableStock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/productos/${product.id}`}>Editar</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                      No hay productos cargados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
