"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { campaignCreateSchema, campaignUpdateSchema } from "@/server/validations/campaign";
import { clientCompanySchema } from "@/server/validations/company";

function nullableDate(value?: Date) {
  return value ?? null;
}

function nullableDecimal(value?: number) {
  return typeof value === "number" ? value : null;
}

async function resolveClientCompany(data: { clientCompanyId?: string; newClientCompanyName?: string }) {
  if (data.newClientCompanyName) {
    const companyData = clientCompanySchema.parse({
      name: data.newClientCompanyName,
      businessType: "Mandante"
    });

    const company = await prisma.company.create({
      data: {
        ...companyData,
        status: "active",
        clientProfile: {
          create: {}
        }
      },
      select: { id: true }
    });

    return company.id;
  }

  if (!data.clientCompanyId) {
    throw new Error("Debes seleccionar una empresa mandante.");
  }

  return data.clientCompanyId;
}

export async function createCampaignAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const parsed = campaignCreateSchema.parse(Object.fromEntries(formData));
  const clientCompanyId = await resolveClientCompany(parsed);

  const campaign = await prisma.campaign.create({
    data: {
      slug: parsed.slug,
      name: parsed.name,
      clientCompanyId,
      shortDescription: parsed.shortDescription,
      description: parsed.description,
      startDate: nullableDate(parsed.startDate),
      endDate: nullableDate(parsed.endDate),
      status: parsed.status,
      accessType: parsed.accessType,
      termsAndConditions: parsed.termsAndConditions,
      minimumOrderAmount: nullableDecimal(parsed.minimumOrderAmount),
      heroImageUrl: parsed.heroImageUrl
    },
    select: { id: true }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/campanas");
  redirect(`/admin/campanas/${campaign.id}`);
}

export async function updateCampaignAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN_EXPOTECH"]);

  const parsed = campaignUpdateSchema.parse(Object.fromEntries(formData));
  const clientCompanyId = await resolveClientCompany(parsed);

  await prisma.campaign.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      name: parsed.name,
      clientCompanyId,
      shortDescription: parsed.shortDescription,
      description: parsed.description,
      startDate: nullableDate(parsed.startDate),
      endDate: nullableDate(parsed.endDate),
      status: parsed.status,
      accessType: parsed.accessType,
      termsAndConditions: parsed.termsAndConditions,
      minimumOrderAmount: nullableDecimal(parsed.minimumOrderAmount),
      heroImageUrl: parsed.heroImageUrl
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/campanas");
  revalidatePath(`/admin/campanas/${parsed.id}`);
  revalidatePath("/cliente");
  revalidatePath("/cliente/campanas");
  redirect(`/admin/campanas/${parsed.id}`);
}
