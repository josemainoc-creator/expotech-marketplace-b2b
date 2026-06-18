import { auth } from "@/auth";
import { exportResponse, type ExportRow } from "@/lib/export";
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";

type ExportRouteProps = {
  params: {
    type: string;
  };
};

function forbidden() {
  return new Response("Forbidden", { status: 403 });
}

export async function GET(request: Request, { params }: ExportRouteProps) {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, status: true, companyId: true }
      })
    : null;

  if (!user || user.status !== "active" || user.role !== "CLIENT_ADMIN" || !user.companyId) {
    return forbidden();
  }

  const format = new URL(request.url).searchParams.get("format");
  const clientCompanyId = user.companyId;
  let rows: ExportRow[] = [];
  const ownershipWhere = { campaign: { clientCompanyId } };

  if (params.type === "pedidos") {
    const orders = await prisma.order.findMany({
      where: ownershipWhere,
      include: {
        campaign: { select: { name: true } },
        buyerCompany: { select: { name: true, rut: true } },
        buyerUser: { select: { email: true, phone: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    rows = orders.map((order) => ({
      id: order.id,
      estado: order.status,
      campana: order.campaign.name,
      comprador: order.buyerCompany.name,
      rut_comprador: order.buyerCompany.rut,
      email_comprador: order.buyerUser.email,
      telefono_comprador: order.buyerUser.phone,
      subtotal: order.subtotal,
      fecha: order.createdAt
    }));
  } else if (params.type === "items") {
    const items = await prisma.orderItem.findMany({
      where: {
        order: ownershipWhere
      },
      include: {
        order: {
          include: {
            campaign: { select: { name: true } },
            buyerCompany: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    rows = items.map((item) => ({
      pedido_id: item.orderId,
      campana: item.order.campaign.name,
      comprador: item.order.buyerCompany.name,
      sku: item.sku,
      producto: item.productName,
      cantidad: item.quantity,
      precio_unitario: item.unitPrice,
      total_linea: item.lineTotal,
      fecha: item.createdAt
    }));
  } else if (params.type === "compradores") {
    const buyers = await prisma.buyerProfile.findMany({
      where: {
        company: {
          buyerOrders: {
            some: ownershipWhere
          }
        }
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        company: true
      },
      orderBy: { createdAt: "desc" }
    });

    rows = buyers.map((buyer) => ({
      empresa: buyer.company.name,
      rut: buyer.company.rut,
      contacto: buyer.user.name,
      email: buyer.user.email,
      telefono: buyer.user.phone,
      region: buyer.company.region,
      comuna: buyer.company.comuna,
      estado_comprador: buyer.approvalStatus,
      compra_estimada: buyer.monthlyPurchaseEstimate,
      categorias: buyer.categoriesOfInterest.join(" | "),
      creado: buyer.createdAt
    }));
  } else {
    return new Response("Not found", { status: 404 });
  }

  return exportResponse(rows, `cliente-${params.type}`, format);
}
