"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { logActivity } from "@/server/activity";
import { requireRole } from "@/server/auth/access";
import { prisma } from "@/server/db/prisma";
import { invitationSchema } from "@/server/validations/invitation";

function defaultExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

export async function createInvitationAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN_EXPOTECH"]);
  const parsed = invitationSchema.parse(Object.fromEntries(formData));
  const token = randomBytes(24).toString("hex");

  const invitation = await prisma.invitation.create({
    data: {
      campaignId: parsed.campaignId,
      email: parsed.email,
      companyName: parsed.companyName,
      contactName: parsed.contactName,
      phone: parsed.phone,
      token,
      status: "created",
      expiresAt: parsed.expiresAt ?? defaultExpiry()
    }
  });

  await logActivity({
    userId: session.user.id,
    campaignId: parsed.campaignId,
    action: "invitation_created",
    entityType: "Invitation",
    entityId: invitation.id,
    metadata: { email: parsed.email }
  });

  revalidatePath("/admin/invitaciones");
}
