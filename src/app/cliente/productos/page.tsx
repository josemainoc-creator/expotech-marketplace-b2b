import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

export default async function ClientProductsPage() {
  const session = await requireRole(["CLIENT_ADMIN"]);

  const products = await prisma.product.findMany({
    where: {
      campaign: {
        clientCompanyId: session.user.companyId ?? ""
      }
    },
    include: {
      campaign: { select: { name: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AppShell
      title="Productos del mandante"
      description="Vista de productos asociados a tus campanas."
      navItems={[
        { href: "/cliente", label: "Panel" },
        { href: "/cliente/campanas", label: "Campanas" }
      ]}
    >
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
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="border-b last:border-0" key={product.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku} - {product.brand ?? "Sin marca"}</div>
                    </td>
                    <td className="px-4 py-3">{product.campaign.name}</td>
                    <td className="px-4 py-3">{product.category?.name ?? "Sin categoria"}</td>
                    <td className="px-4 py-3">{formatMoney(product.wholesalePrice)}</td>
                    <td className="px-4 py-3">{product.availableStock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                  </tr>
                ))}
                {products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No hay productos asociados a tus campanas.
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
