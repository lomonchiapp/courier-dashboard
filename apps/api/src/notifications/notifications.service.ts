import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EmailChannel } from "./channels/email.channel";
import { WebhookChannel } from "./channels/webhook.channel";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailChannel: EmailChannel,
    private readonly webhookChannel: WebhookChannel
  ) {}

  /**
   * Dispatch notifications for a given event.
   * Fire-and-forget: errors are caught and logged, never thrown.
   */
  async dispatch(
    tenantId: string,
    event: string,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      const templates = await this.prisma.notificationTemplate.findMany({
        where: { tenantId, event, isActive: true },
      });

      if (templates.length === 0) {
        this.logger.debug(
          `No active templates for tenant=${tenantId} event=${event}`
        );
        return;
      }

      const tasks = templates.map((template) =>
        this.processTemplate(tenantId, event, template, payload)
      );

      await Promise.allSettled(tasks);
    } catch (err: any) {
      this.logger.error(
        `dispatch error tenant=${tenantId} event=${event}: ${err.message}`
      );
    }
  }

  renderTemplate(body: string, payload: Record<string, any>): string {
    return body.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_match, key: string) => {
      const value = key
        .split(".")
        .reduce(
          (obj: any, k: string) =>
            obj !== null && obj !== undefined ? obj[k] : undefined,
          payload
        );
      return value !== undefined && value !== null ? String(value) : "";
    });
  }

  private async processTemplate(
    tenantId: string,
    event: string,
    template: {
      id: string;
      channel: string;
      subject: string | null;
      body: string;
    },
    payload: Record<string, any>
  ): Promise<void> {
    const renderedBody = this.renderTemplate(template.body, payload);
    const renderedSubject = template.subject
      ? this.renderTemplate(template.subject, payload)
      : undefined;

    switch (template.channel) {
      case "EMAIL":
        await this.handleEmail(
          tenantId,
          event,
          renderedSubject,
          renderedBody,
          payload
        );
        break;
      case "WEBHOOK":
        await this.handleWebhook(tenantId, event, payload);
        break;
      case "SMS":
      case "PUSH":
        await this.prisma.notificationLog.create({
          data: {
            tenantId,
            channel: template.channel as any,
            recipient: payload.customerEmail || payload.recipient || "unknown",
            event,
            subject: renderedSubject,
            body: renderedBody,
            status: "PENDING",
            error: `${template.channel} channel not configured`,
          },
        });
        this.logger.debug(
          `${template.channel} channel not configured — logged as PENDING`
        );
        break;
    }
  }

  private async handleEmail(
    tenantId: string,
    event: string,
    subject: string | undefined,
    body: string,
    payload: Record<string, any>
  ): Promise<void> {
    const recipient =
      payload.customerEmail || payload.email || payload.recipient;
    if (!recipient) {
      this.logger.warn(`No email recipient found in payload for event=${event}`);
      return;
    }

    // Check customer preferences if customerId is present
    if (payload.customerId) {
      const pref = await this.prisma.customerNotificationPref.findUnique({
        where: {
          tenantId_customerId_channel_event: {
            tenantId,
            customerId: payload.customerId,
            channel: "EMAIL",
            event,
          },
        },
      });
      if (pref && !pref.enabled) {
        this.logger.debug(
          `Customer ${payload.customerId} has disabled EMAIL for ${event}`
        );
        return;
      }
    }

    const result = await this.emailChannel.send(
      recipient,
      subject || event,
      body
    );

    await this.prisma.notificationLog.create({
      data: {
        tenantId,
        customerId: payload.customerId || null,
        channel: "EMAIL",
        recipient,
        event,
        subject: subject || event,
        body,
        status: result.success ? "SENT" : "FAILED",
        error: result.error || null,
        sentAt: result.success ? new Date() : null,
      },
    });
  }

  private async handleWebhook(
    tenantId: string,
    event: string,
    payload: Record<string, any>
  ): Promise<void> {
    const subscriptions = await this.prisma.webhookSubscription.findMany({
      where: {
        tenantId,
        isActive: true,
        events: { has: event },
      },
    });

    const tasks = subscriptions.map(async (sub) => {
      const result = await this.webhookChannel.send(
        sub.url,
        sub.secret,
        event,
        payload
      );

      await this.prisma.notificationLog.create({
        data: {
          tenantId,
          channel: "WEBHOOK",
          recipient: sub.url,
          event,
          subject: null,
          body: JSON.stringify(payload),
          status: result.success ? "SENT" : "FAILED",
          error: result.error || null,
          sentAt: result.success ? new Date() : null,
        },
      });
    });

    await Promise.allSettled(tasks);
  }
}
