import { prisma } from "@/server/db/prisma";

type ActivityInput = {
  userId?: string | null;
  campaignId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity({
  userId,
  campaignId,
  action,
  entityType,
  entityId,
  metadata
}: ActivityInput) {
  return prisma.activityLog.create({
    data: {
      userId,
      campaignId,
      action,
      entityType,
      entityId,
      metadata
    }
  });
}
