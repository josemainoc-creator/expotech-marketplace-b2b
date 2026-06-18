"use server";

import { revalidatePath } from "next/cache";

import { logActivity } from "@/server/activity";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { buyerProfileIdSchema, rejectBuyerSchema } from "@/server/validations/buyer";

async function findBuyerProfile(id: string) {
  return prisma.buyerProfile.findUnique({
    where: { id },
    include: {
      company: true,
      user: true
    }
  });
}

export async function approveBuyerAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = buyerProfileIdSchema.parse(Object.fromEntries(formData));
  const buyerProfile = await findBuyerProfile(parsed.buyerProfileId);

  if (!buyerProfile) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.buyerProfile.update({
      where: { id: buyerProfile.id },
      data: {
        approvalStatus: "approved",
        approvedAt: new Date(),
        rejectedReason: null
      }
    });

    await tx.company.update({
      where: { id: buyerProfile.companyId },
      data: { status: "active" }
    });

    await tx.leadStatus.updateMany({
      where: { companyId: buyerProfile.companyId },
      data: {
        status: "approved",
        lastContactAt: new Date()
      }
    });

    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        action: "buyer_approved",
        entityType: "BuyerProfile",
        entityId: buyerProfile.id,
        metadata: {
          buyerUserId: buyerProfile.userId,
          companyId: buyerProfile.companyId
        }
      }
    });
  });

  await logActivity({
    userId: buyerProfile.userId,
    action: "buyer_approval_status_changed",
    entityType: "BuyerProfile",
    entityId: buyerProfile.id,
    metadata: { approvalStatus: "approved" }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/compradores");
}

export async function rejectBuyerAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = rejectBuyerSchema.parse(Object.fromEntries(formData));
  const buyerProfile = await findBuyerProfile(parsed.buyerProfileId);

  if (!buyerProfile) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.buyerProfile.update({
      where: { id: buyerProfile.id },
      data: {
        approvalStatus: "rejected",
        approvedAt: null,
        rejectedReason: parsed.rejectedReason
      }
    });

    await tx.company.update({
      where: { id: buyerProfile.companyId },
      data: { status: "inactive" }
    });

    await tx.leadStatus.updateMany({
      where: { companyId: buyerProfile.companyId },
      data: {
        status: "rejected",
        lastContactAt: new Date(),
        notes: parsed.rejectedReason
      }
    });

    await tx.activityLog.create({
      data: {
        userId: session.user.id,
        action: "buyer_rejected",
        entityType: "BuyerProfile",
        entityId: buyerProfile.id,
        metadata: {
          buyerUserId: buyerProfile.userId,
          companyId: buyerProfile.companyId,
          rejectedReason: parsed.rejectedReason
        }
      }
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/compradores");
}
