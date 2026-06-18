import { redirect } from "next/navigation";
import type { Campaign, Order, UserRole } from "@prisma/client";

import { auth } from "@/auth";
import { hasRole } from "@/server/auth/roles";
import { prisma } from "@/server/db/prisma";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      companyId: true,
      status: true,
      company: {
        select: {
          id: true,
          name: true,
          rut: true,
          status: true
        }
      },
      buyerProfile: {
        select: {
          approvalStatus: true,
          businessType: true,
          monthlyPurchaseEstimate: true,
          categoriesOfInterest: true
        }
      }
    }
  });
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      companyId: true,
      status: true
    }
  });

  if (!user || user.status !== "active") {
    redirect("/login");
  }

  session.user.role = user.role;
  session.user.companyId = user.companyId;

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();

  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/");
  }

  return session;
}

export function canAccessCampaign(
  user: { role: UserRole; companyId: string | null },
  campaign: Pick<Campaign, "clientCompanyId">
) {
  if (user.role === "SUPER_ADMIN_EXPOTECH") {
    return true;
  }

  if (user.role === "CLIENT_ADMIN") {
    return Boolean(user.companyId && user.companyId === campaign.clientCompanyId);
  }

  return false;
}

export async function assertClientOwnsCampaign(campaignId: string, user: { role: UserRole; companyId: string | null }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      clientCompany: {
        select: {
          id: true,
          name: true,
          rut: true,
          email: true,
          phone: true
        }
      }
    }
  });

  if (!campaign) {
    redirect("/cliente/campanas");
  }

  if (!canAccessCampaign(user, campaign)) {
    redirect("/cliente");
  }

  return campaign;
}

export function canAccessOrder(
  user: { id: string; role: UserRole; companyId: string | null },
  order: Pick<Order, "buyerUserId" | "buyerCompanyId"> & { campaign: Pick<Campaign, "clientCompanyId"> }
) {
  if (user.role === "SUPER_ADMIN_EXPOTECH") {
    return true;
  }

  if (user.role === "CLIENT_ADMIN") {
    return Boolean(user.companyId && user.companyId === order.campaign.clientCompanyId);
  }

  return user.id === order.buyerUserId;
}

export async function assertBuyerApproved(userId: string) {
  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId },
    select: { approvalStatus: true }
  });

  if (buyerProfile?.approvalStatus !== "approved") {
    redirect("/solicitar-acceso");
  }

  return buyerProfile;
}
