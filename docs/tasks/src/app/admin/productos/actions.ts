"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseCsv } from "@/lib/csv";
import { slugify } from "@/lib/product";
import { logActivity } from "@/server/activity";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { csvProductRowSchema, productCreateSchema, productImportSchema, productUpdateSchema } from "@/server/validations/product";

async function resolveCategory(campaignId: string, categoryId?: string, newCategoryName?: string) {
  if (newCategoryName) {
    const category = await prisma.productCategory.upsert({
      where: {
        campaignId_slug: {
          campaignId,
          slug: slugify(newCategoryName)
        }
      },
      update: {
        name: newCategoryName
      },
      create: {
        campaignId,
        name: newCategoryName,
        slug: slugify(newCategoryName)
      },
      select: { id: true }
    });

    return category.id;
  }

  if (categoryId) {
    const category = await prisma.productCategory.findFirst({
      where: {
        id: categoryId,
        campaignId
      },
      select: { id: true }
    });

    if (!category) {
      throw new Error("La categoria seleccionada no pertenece a la campana.");
    }

    return category.id;
  }

  return null;
}

function nullableDate(value?: Date) {
  return value ?? null;
}

function nullableDecimal(value?: number) {
  return typeof value === "number" ? value : null;
}

export async function createProductAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = productCreateSchema.parse(Object.fromEntries(formData));
  const categoryId = await resolveCategory(parsed.campaignId, parsed.categoryId, parsed.newCategoryName);

  const product = await prisma.product.create({
    data: {
      campaignId: parsed.campaignId,
      categoryId,
      sku: parsed.sku,
      name: parsed.name,
      brand: parsed.brand,
      description: parsed.description,
      regularPrice: nullableDecimal(parsed.regularPrice),
      liquidationPrice: nullableDecimal(parsed.liquidationPrice),
      wholesalePrice: parsed.wholesalePrice,
      minOrderQty: parsed.minOrderQty,
      unitType: parsed.unitType,
      unitsPerBox: parsed.unitsPerBox,
      availableStock: parsed.availableStock,
      expirationDate: nullableDate(parsed.expirationDate),
      status: parsed.status,
      featured: parsed.featured,
      imageUrl: parsed.imageUrl
    },
    select: { id: true, campaignId: true }
  });

  await logActivity({
    userId: session.user.id,
    campaignId: product.campaignId,
    action: "product_created",
    entityType: "Product",
    entityId: product.id
  });

  revalidatePath("/admin/productos");
  revalidatePath("/cliente/productos");
  revalidatePath("/catalogo");
  redirect(`/admin/productos/${product.id}`);
}

export async function updateProductAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = productUpdateSchema.parse(Object.fromEntries(formData));
  const categoryId = await resolveCategory(parsed.campaignId, parsed.categoryId, parsed.newCategoryName);

  await prisma.product.update({
    where: { id: parsed.id },
    data: {
      campaignId: parsed.campaignId,
      categoryId,
      sku: parsed.sku,
      name: parsed.name,
      brand: parsed.brand,
      description: parsed.description,
      regularPrice: nullableDecimal(parsed.regularPrice),
      liquidationPrice: nullableDecimal(parsed.liquidationPrice),
      wholesalePrice: parsed.wholesalePrice,
      minOrderQty: parsed.minOrderQty,
      unitType: parsed.unitType,
      unitsPerBox: parsed.unitsPerBox,
      availableStock: parsed.availableStock,
      expirationDate: nullableDate(parsed.expirationDate),
      status: parsed.status,
      featured: parsed.featured,
      imageUrl: parsed.imageUrl
    }
  });

  await logActivity({
    userId: session.user.id,
    campaignId: parsed.campaignId,
    action: "product_updated",
    entityType: "Product",
    entityId: parsed.id
  });

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${parsed.id}`);
  revalidatePath("/cliente/productos");
  revalidatePath("/catalogo");
  redirect(`/admin/productos/${parsed.id}`);
}

export async function importProductsAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = productImportSchema.parse(Object.fromEntries(formData));
  const rows = parseCsv(parsed.csvText);
  let imported = 0;

  for (const row of rows) {
    const productRow = csvProductRowSchema.parse({
      ...row,
      regularPrice: row.regularPrice || undefined,
      unitsPerBox: row.unitsPerBox || undefined,
      expirationDate: row.expirationDate || undefined
    });
    const categoryId = await resolveCategory(parsed.campaignId, undefined, productRow.category);

    await prisma.product.upsert({
      where: {
        campaignId_sku: {
          campaignId: parsed.campaignId,
          sku: productRow.sku
        }
      },
      update: {
        categoryId,
        name: productRow.name,
        brand: productRow.brand,
        description: productRow.description,
        regularPrice: nullableDecimal(productRow.regularPrice),
        wholesalePrice: productRow.wholesalePrice,
        minOrderQty: productRow.minOrderQty,
        unitType: productRow.unitType,
        unitsPerBox: productRow.unitsPerBox,
        availableStock: productRow.availableStock,
        expirationDate: nullableDate(productRow.expirationDate),
        status: productRow.availableStock > 0 ? "active" : "out_of_stock"
      },
      create: {
        campaignId: parsed.campaignId,
        categoryId,
        sku: productRow.sku,
        name: productRow.name,
        brand: productRow.brand,
        description: productRow.description,
        regularPrice: nullableDecimal(productRow.regularPrice),
        wholesalePrice: productRow.wholesalePrice,
        minOrderQty: productRow.minOrderQty,
        unitType: productRow.unitType,
        unitsPerBox: productRow.unitsPerBox,
        availableStock: productRow.availableStock,
        expirationDate: nullableDate(productRow.expirationDate),
        status: productRow.availableStock > 0 ? "active" : "out_of_stock"
      }
    });

    imported += 1;
  }

  await logActivity({
    userId: session.user.id,
    campaignId: parsed.campaignId,
    action: "products_imported",
    entityType: "Product",
    metadata: { imported }
  });

  revalidatePath("/admin/productos");
  revalidatePath("/cliente/productos");
  revalidatePath("/catalogo");
  redirect(`/admin/productos/importar?estado=importado&cantidad=${imported}`);
}
