import { AppShell } from "@/components/app-shell";
import { CartClient } from "@/components/cart-client";
import { submitOrderAction } from "@/app/carrito/actions";
import { requireRole, assertBuyerApproved } from "@/server/auth/access";

type CartPageProps = {
  searchParams?: {
    error?: string;
    sku?: string;
  };
};

const errorMessages: Record<string, string> = {
  empresa: "Tu usuario comprador no tiene empresa asociada.",
  vacio: "El carrito esta vacio.",
  productos: "Algunos productos ya no estan disponibles.",
  campana: "Solo puedes enviar productos de una campana por solicitud.",
  minimo: "Hay un producto bajo su minimo de compra.",
  stock: "Hay un producto con cantidad mayor al stock disponible.",
  "minimo-campana": "El subtotal esta bajo el minimo de compra de la campana."
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const session = await requireRole(["BUYER"]);
  await assertBuyerApproved(session.user.id);

  return (
    <AppShell
      eyebrow="Solicitud de pedido"
      title="Carrito"
      description="Prepara una solicitud comercial sujeta a validacion de stock y condiciones."
      navItems={[
        { href: "/catalogo", label: "Catalogo" },
        { href: "/mis-pedidos", label: "Mis pedidos" }
      ]}
    >
      {searchParams?.error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessages[searchParams.error] ?? "No pudimos enviar la solicitud."}
          {searchParams.sku ? ` SKU: ${searchParams.sku}` : ""}
        </div>
      ) : null}
      <CartClient action={submitOrderAction} />
    </AppShell>
  );
}
