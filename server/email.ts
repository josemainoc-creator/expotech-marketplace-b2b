import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

type SendEmailInput = {
  campaignId?: string | null;
  recipientEmail: string;
  subject: string;
  templateName: string;
  html: string;
  metadata?: Prisma.InputJsonObject;
};

export async function sendTransactionalEmail({
  campaignId,
  recipientEmail,
  subject,
  templateName,
  html,
  metadata
}: SendEmailInput) {
  const emailLog = await prisma.emailLog.create({
    data: {
      campaignId,
      recipientEmail,
      subject,
      templateName,
      status: "queued",
      metadata
    }
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "failed",
        metadata: {
          ...(metadata ?? {}),
          reason: "missing_resend_configuration"
        }
      }
    });
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject,
        html
      })
    });

    const result = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: response.ok ? "sent" : "failed",
        providerMessageId: result.id,
        sentAt: response.ok ? new Date() : null,
        metadata: {
          ...(metadata ?? {}),
          providerResponse: result
        }
      }
    });
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "failed",
        metadata: {
          ...(metadata ?? {}),
          error: error instanceof Error ? error.message : "unknown_error"
        }
      }
    });
  }
}
