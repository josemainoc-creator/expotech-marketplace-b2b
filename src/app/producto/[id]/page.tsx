import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatMoney } from "@/lib/format";
import { discountPercent } from "@/lib/product";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);
  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
      status: "active",
      campaign: { status: "active" }
    },
    include: {
      campaign: { select: { name: true, termsAndConditions: true } },
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" } }
    }
  });

  if (!product) {
    notFound();
  }

  const discount = discountPercent(product.regularPrice, product.wholesalePrice);

  return (
    <AppShell title={product.name} description="Detalle privado disponible solo para compradores aprobados.">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <div className="aspect-[4/3] overflow-hidden rounded-md border bg-muted">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin imagen</div>
            )}
          </div>
          {product.images.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image) => (
                <img src={image.url} alt={image.altText ?? product.name} className="aspect-square rounded-md border object-cover" key={image.id} />
              ))}
            </div>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{product.name}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">{product.brand ?? "Marca no informada"} - SKU {product.sku}</p>
              </div>
              <StatusBadge status={product.availableStock > 0 ? product.status : "out_of_stock"} />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-3xl font-semibold">{formatMoney(product.wholesalePrice)}</div>
              <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
                {product.regularPrice ? <span className="line-through">{formatMoney(product.regularPrice)}</span> : null}
                {discount ? <span>{discount}% ahorro</span> : null}
              </div>
            </div>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Categoria</div>
                <div className="font-medium">{product.category?.name ?? "Sin categoria"}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Campana</div>
                <div className="font-medium">{product.campaign.name}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Stock referencial</div>
                <div className="font-medium">{product.availableStock}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Minimo</div>
                <div className="font-medium">{product.minOrderQty} {product.unitType}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Unidades por caja</div>
                <div className="font-medium">{product.unitsPerBox ?? "No informado"}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">Vencimiento</div>
                <div className="font-medium">{formatDate(product.expirationDate)}</div>
              </div>
            </div>
            {product.description ? <p className="text-sm text-muted-foreground">{product.description}</p> : null}
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Stock informado sujeto a confirmacion. Este detalle no constituye una venta confirmada.
            </div>
            <AddToCartButton
              productId={product.id}
              minOrderQty={product.minOrderQty}
              availableStock={product.availableStock}
              className="w-full"
            />
            {product.campaign.termsAndConditions ? (
              <div className="rounded-md border p-3 text-sm text-muted-foreground">{product.campaign.termsAndConditions}</div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
