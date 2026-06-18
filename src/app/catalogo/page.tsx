import type { Prisma } from "@prisma/client";

import { AccessBadge, AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";

type CatalogPageProps = {
  searchParams?: {
    q?: string;
    category?: string;
    brand?: string;
    priceMin?: string;
    priceMax?: string;
    availability?: string;
    expiringSoon?: string;
    sort?: string;
  };
};

type PriceValue = { toString(): string } | number | null;

function sortProducts<T extends { regularPrice: PriceValue; wholesalePrice: PriceValue; createdAt: Date; name: string; availableStock: number }>(
  products: T[],
  sort?: string
) {
  if (sort === "discount_desc") {
    return [...products].sort((a, b) => {
      const regularA = Number(a.regularPrice?.toString() ?? 0);
      const regularB = Number(b.regularPrice?.toString() ?? 0);
      const wholesaleA = Number(a.wholesalePrice?.toString() ?? 0);
      const wholesaleB = Number(b.wholesalePrice?.toString() ?? 0);
      const discountA = regularA > wholesaleA ? (regularA - wholesaleA) / regularA : 0;
      const discountB = regularB > wholesaleB ? (regularB - wholesaleB) / regularB : 0;
      return discountB - discountA;
    });
  }

  return products;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);
  const soon = new Date();
  soon.setDate(soon.getDate() + 90);
  const sort = searchParams?.sort ?? "newest";

  const where: Prisma.ProductWhereInput = {
    status: "active" as const,
    campaign: {
      status: "active" as const
    },
    ...(searchParams?.q
      ? {
          OR: [
            { sku: { contains: searchParams.q, mode: "insensitive" as const } },
            { name: { contains: searchParams.q, mode: "insensitive" as const } },
            { brand: { contains: searchParams.q, mode: "insensitive" as const } }
          ]
        }
      : {}),
    ...(searchParams?.category ? { categoryId: searchParams.category } : {}),
    ...(searchParams?.brand ? { brand: searchParams.brand } : {}),
    ...(searchParams?.priceMin || searchParams?.priceMax
      ? {
          wholesalePrice: {
            ...(searchParams.priceMin ? { gte: Number(searchParams.priceMin) } : {}),
            ...(searchParams.priceMax ? { lte: Number(searchParams.priceMax) } : {})
          }
        }
      : {}),
    ...(searchParams?.availability === "in_stock" ? { availableStock: { gt: 0 } } : {}),
    ...(searchParams?.expiringSoon === "on" ? { expirationDate: { lte: soon, not: null } } : {})
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { wholesalePrice: "asc" as const }
      : sort === "price_desc"
        ? { wholesalePrice: "desc" as const }
        : sort === "stock_desc"
          ? { availableStock: "desc" as const }
          : sort === "name_asc"
            ? { name: "asc" as const }
            : { createdAt: "desc" as const };

  const [productsRaw, categoriesRaw, brandsRaw] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: sort === "discount_desc" ? { createdAt: "desc" } : orderBy
    }),
    prisma.productCategory.findMany({
      where: {
        campaign: { status: "active" },
        products: { some: { status: "active" } }
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.product.findMany({
      where: { status: "active", brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" }
    })
  ]);
  const products = sortProducts(productsRaw, sort);

  return (
    <AppShell
      eyebrow="Catalogo privado"
      title="Catalogo"
      description="Precios exclusivos para compradores mayoristas aprobados. Stock informado sujeto a confirmacion."
      navItems={[
        { href: "/carrito", label: "Carrito" },
        { href: "/mis-pedidos", label: "Mis pedidos" },
        { href: "/mi-cuenta", label: "Mi cuenta" }
      ]}
    >
      <div className="space-y-6">
        <AccessBadge variant="buyer" />
        <form className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-4">
          <input name="q" defaultValue={searchParams?.q ?? ""} className="h-10 rounded-md border px-3 text-sm" placeholder="Buscar SKU, nombre o marca" />
          <select name="category" defaultValue={searchParams?.category ?? ""} className="h-10 rounded-md border px-3 text-sm">
            <option value="">Todas las categorias</option>
            {categoriesRaw.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select name="brand" defaultValue={searchParams?.brand ?? ""} className="h-10 rounded-md border px-3 text-sm">
            <option value="">Todas las marcas</option>
            {brandsRaw.map((item) => (
              <option value={item.brand ?? ""} key={item.brand}>
                {item.brand}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={sort} className="h-10 rounded-md border px-3 text-sm">
            <option value="newest">Mas reciente</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
            <option value="discount_desc">Mayor descuento</option>
            <option value="stock_desc">Mayor stock</option>
            <option value="name_asc">Nombre</option>
          </select>
          <input name="priceMin" defaultValue={searchParams?.priceMin ?? ""} className="h-10 rounded-md border px-3 text-sm" placeholder="Precio minimo" type="number" min="0" />
          <input name="priceMax" defaultValue={searchParams?.priceMax ?? ""} className="h-10 rounded-md border px-3 text-sm" placeholder="Precio maximo" type="number" min="0" />
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input type="checkbox" name="availability" value="in_stock" defaultChecked={searchParams?.availability === "in_stock"} />
            Con stock
          </label>
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input type="checkbox" name="expiringSoon" value="on" defaultChecked={searchParams?.expiringSoon === "on"} />
            Vence pronto
          </label>
          <div className="flex gap-2 md:col-span-4">
            <Button type="submit">Filtrar</Button>
            <Button asChild variant="outline">
              <a href="/catalogo">Limpiar</a>
            </Button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
        {products.length === 0 ? (
          <div className="rounded-md border p-6 text-sm text-muted-foreground">No hay productos activos para los filtros seleccionados.</div>
        ) : null}
      </div>
    </AppShell>
  );
}
