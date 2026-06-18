"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

type CartProduct = {
  id: string;
  campaignId: string;
  sku: string;
  name: string;
  brand: string | null;
  wholesalePrice: string;
  regularPrice: string | null;
  minOrderQty: number;
  unitType: string;
  availableStock: number;
  imageUrl: string | null;
  campaign: {
    name: string;
    minimumOrderAmount: string | null;
  };
};

type CartItem = {
  productId: string;
  quantity: number;
};

type CartClientProps = {
  action: (formData: FormData) => Promise<void>;
};

const cartKey = "expotech-cart";

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(cartKey) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  window.localStorage.setItem(cartKey, JSON.stringify(cart));
}

export function CartClient({ action }: CartClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCart(readCart());
  }, []);

  useEffect(() => {
    async function loadProducts() {
      if (cart.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetch(`/api/cart-products?ids=${cart.map((item) => item.productId).join(",")}`);
      const data = (await response.json()) as { products: CartProduct[] };
      setProducts(data.products);
      setLoading(false);
    }

    loadProducts();
  }, [cart]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const subtotal = cart.reduce((total, item) => {
    const product = productById.get(item.productId);
    return total + (product ? Number(product.wholesalePrice) * item.quantity : 0);
  }, 0);
  const campaignIds = new Set(products.map((product) => product.campaignId));
  const minimumOrderAmount = Number(products[0]?.campaign.minimumOrderAmount ?? 0);

  function updateQuantity(productId: string, quantity: number) {
    const product = productById.get(productId);
    const safeQuantity = Math.max(product?.minOrderQty ?? 1, Math.min(quantity, product?.availableStock ?? quantity));
    const nextCart = cart.map((item) => (item.productId === productId ? { ...item, quantity: safeQuantity } : item));
    setCart(nextCart);
    writeCart(nextCart);
  }

  function removeItem(productId: string) {
    const nextCart = cart.filter((item) => item.productId !== productId);
    setCart(nextCart);
    writeCart(nextCart);
  }

  if (loading) {
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Cargando carrito...</div>;
  }

  if (cart.length === 0 || products.length === 0) {
    return <div className="rounded-md border p-6 text-sm text-muted-foreground">Tu carrito esta vacio.</div>;
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="cartJson" value={JSON.stringify(cart)} />
      <div className="space-y-4">
        {cart.map((item) => {
          const product = productById.get(item.productId);

          if (!product) {
            return null;
          }

          return (
            <div className="grid gap-4 rounded-md border bg-card p-4 md:grid-cols-[96px_1fr_auto]" key={item.productId}>
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">{product.sku} - {product.brand ?? "Sin marca"}</p>
                <p className="text-sm text-muted-foreground">Campana: {product.campaign.name}</p>
                <p className="text-sm">Precio: {formatMoney(Number(product.wholesalePrice))}</p>
                <p className="text-sm">Minimo: {product.minOrderQty} {product.unitType} · Stock referencial: {product.availableStock}</p>
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  min={product.minOrderQty}
                  max={product.availableStock}
                  value={item.quantity}
                  onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                  className="h-10 w-28 rounded-md border px-3 text-sm"
                />
                <Button type="button" variant="outline" onClick={() => removeItem(item.productId)}>
                  Eliminar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="space-y-4 rounded-md border bg-card p-5">
        <div>
          <div className="text-sm text-muted-foreground">Subtotal solicitado</div>
          <div className="text-2xl font-semibold">{formatMoney(subtotal)}</div>
        </div>
        {minimumOrderAmount > 0 ? (
          <p className="text-sm text-muted-foreground">Minimo campana: {formatMoney(minimumOrderAmount)}</p>
        ) : null}
        {campaignIds.size > 1 ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            El carrito solo puede contener productos de una campana por solicitud.
          </p>
        ) : null}
        {minimumOrderAmount > 0 && subtotal < minimumOrderAmount ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            El subtotal esta bajo el minimo de compra de la campana.
          </p>
        ) : null}
        <label className="space-y-2 text-sm font-medium">
          Notas
          <textarea name="notes" className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Condicion de pago solicitada
          <input name="paymentConditionRequested" className="h-10 w-full rounded-md border px-3 text-sm" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Entrega solicitada
          <input name="deliveryMethodRequested" className="h-10 w-full rounded-md border px-3 text-sm" />
        </label>
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Este pedido no constituye una venta final confirmada. Stock, precio, pago y despacho seran validados antes de confirmar.
        </p>
        <Button type="submit" className="w-full" disabled={campaignIds.size > 1 || (minimumOrderAmount > 0 && subtotal < minimumOrderAmount)}>
          Enviar solicitud de pedido
        </Button>
      </aside>
    </form>
  );
}
