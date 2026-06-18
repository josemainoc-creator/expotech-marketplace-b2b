import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/server/db/prisma";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "BUYER") {
    return NextResponse.json({ products: [] }, { status: 401 });
  }

  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: session.user.id },
    select: { approvalStatus: true }
  });

  if (buyerProfile?.approvalStatus !== "approved") {
    return NextResponse.json({ products: [] }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      status: "active",
      campaign: { status: "active" }
    },
    select: {
      id: true,
      campaignId: true,
      sku: true,
      name: true,
      brand: true,
      wholesalePrice: true,
      regularPrice: true,
      minOrderQty: true,
      unitType: true,
      availableStock: true,
      imageUrl: true,
      campaign: {
        select: {
          name: true,
          minimumOrderAmount: true
        }
      }
    }
  });

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      wholesalePrice: product.wholesalePrice.toString(),
      regularPrice: product.regularPrice?.toString() ?? null,
      campaign: {
        ...product.campaign,
        minimumOrderAmount: product.campaign.minimumOrderAmount?.toString() ?? null
      }
    }))
  });
}
