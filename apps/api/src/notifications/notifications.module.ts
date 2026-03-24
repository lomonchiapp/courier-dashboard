import { Global, Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { EmailChannel } from "./channels/email.channel";
import { WebhookChannel } from "./channels/webhook.channel";
import { TemplatesController } from "./templates.controller";
import { LogsController } from "./logs.controller";
import { WebhooksController } from "./webhooks.controller";
import { NotificationPrefsController } from "./notification-prefs.controller";

@Global()
@Module({
  controllers: [
    TemplatesController,
    LogsController,
    WebhooksController,
    NotificationPrefsController,
  ],
  providers: [NotificationsService, EmailChannel, WebhookChannel],
  exports: [NotificationsService],
})
export class NotificationsModule {}
