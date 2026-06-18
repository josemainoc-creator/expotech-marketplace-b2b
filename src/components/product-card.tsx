import Link from "next/link";
import type { Product, ProductCategory } from "@prisma/client";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";
import { discountPercent } from "@/lib/product";

type ProductCardProps = {
  product: Product & {
    category: Pick<ProductCategory, "name"> | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = discountPercent(product.regularPrice, product.wholesalePrice);

  return (
    <article className="grid overflow-hidden rounded-md border bg-card">
      <div className="aspect-[4/3] bg-muted">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sin imagen</div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold leading-tight">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.brand ?? "Marca no informada"}</p>
          </div>
          <StatusBadge status={product.availableStock > 0 ? product.status : "out_of_stock"} />
        </div>
        <div className="grid gap-1 text-sm text-muted-foreground">
          <span>SKU: {product.sku}</span>
          <span>Categoria: {product.category?.name ?? "Sin categoria"}</span>
          <span>Vencimiento: {formatDate(product.expirationDate)}</span>
        </div>
        <div>
          <div className="text-xl font-semibold">{formatMoney(product.wholesalePrice)}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.regularPrice ? <span className="line-through">{formatMoney(product.regularPrice)}</span> : null}
            {discount ? <span>{discount}% descuento</span> : null}
          </div>
        </div>
        <div className="grid gap-1 text-sm">
          <span>Stock referencial: {product.availableStock}</span>
          <span>Minimo: {product.minOrderQty} {product.unitType}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/producto/${product.id}`}>Ver detalle</Link>
          </Button>
          <AddToCartButton productId={product.id} minOrderQty={product.minOrderQty} availableStock={product.availableStock} className="w-full" />
        </div>
      </div>
    </article>
  );
}
