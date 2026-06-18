"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

import { logActivity } from "@/server/activity";
import { prisma } from "@/server/db/prisma";
import { buyerRegistrationSchema } from "@/server/validations/buyer";

function normalizeCategories(formData: FormData) {
  return formData.getAll("categoriesOfInterest").map(String).filter(Boolean);
}

export async function registerBuyerAction(formData: FormData) {
  const parsed = buyerRegistrationSchema.parse({
    ...Object.fromEntries(formData),
    categoriesOfInterest: normalizeCategories(formData)
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email },
    select: { id: true }
  });

  if (existingUser) {
    redirect("/registro?estado=email-existente");
  }

  const existingCompany = await prisma.company.findUnique({
    where: { rut: parsed.rut },
    select: { id: true }
  });

  if (existingCompany) {
    redirect("/registro?estado=rut-existente");
  }

  const invitation = parsed.invitationToken
    ? await prisma.invitation.findUnique({
        where: { token: parsed.invitationToken },
        include: { campaign: true }
      })
    : null;

  if (parsed.invitationToken && (!invitation || invitation.expiresAt < new Date() || invitation.status === "cancelled")) {
    redirect("/registro?estado=invitacion-invalida");
  }

  const passwordHash = await hash(parsed.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: parsed.companyName,
        rut: parsed.rut,
        businessType: parsed.businessType,
        contactName: parsed.contactName,
        email: parsed.email,
        phone: parsed.phone,
        region: parsed.region,
        comuna: parsed.comuna,
        address: parsed.address,
        status: "pending"
      }
    });

    const user = await tx.user.create({
      data: {
        name: parsed.contactName,
        email: parsed.email,
        phone: parsed.phone,
        passwordHash,
        role: "BUYER",
        status: "active",
        companyId: company.id
      }
    });

    const buyerProfile = await tx.buyerProfile.create({
      data: {
        userId: user.id,
        companyId: company.id,
        businessType: parsed.tradeType,
        monthlyPurchaseEstimate: parsed.monthlyPurchaseEstimate,
        categoriesOfInterest: parsed.categoriesOfInterest,
        approvalStatus: "pending"
      }
    });

    if (invitation) {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "registered",
          registeredAt: new Date()
        }
      });

      await tx.leadStatus.upsert({
        where: {
          campaignId_companyId: {
            campaignId: invitation.campaignId,
            companyId: company.id
          }
        },
        update: {
          status: "interested",
          source: "invitation",
          lastContactAt: new Date()
        },
        create: {
          campaignId: invitation.campaignId,
          companyId: company.id,
          status: "interested",
          priority: "medium",
          source: "invitation",
          lastContactAt: new Date(),
          notes: "Registro completado desde invitacion."
        }
      });
    } else {
      const fallbackCampaign = await tx.campaign.findFirst({
        where: { status: { in: ["active", "draft", "paused"] } },
        orderBy: { createdAt: "desc" },
        select: { id: true }
      });

      if (fallbackCampaign) {
        await tx.leadStatus.create({
          data: {
            campaignId: fallbackCampaign.id,
            companyId: company.id,
            status: "new",
            priority: "medium",
            source: "access_request",
            lastContactAt: new Date(),
            notes: "Solicitud de acceso espontanea."
          }
        });
      }
    }

    await tx.activityLog.create({
      data: {
        userId: user.id,
        campaignId: invitation?.campaignId,
        action: "buyer_registration_submitted",
        entityType: "BuyerProfile",
        entityId: buyerProfile.id,
        metadata: {
          source: invitation ? "invitation" : "access_request",
          companyId: company.id
        }
      }
    });

    return { userId: user.id, buyerProfileId: buyerProfile.id };
  });

  await logActivity({
    userId: result.userId,
    campaignId: invitation?.campaignId,
    action: "buyer_access_request_received",
    entityType: "BuyerProfile",
    entityId: result.buyerProfileId
  });

  redirect("/solicitar-acceso?estado=recibida");
}
