import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { CustomerAuth } from "@/common/decorators/customer-auth-context.decorator";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { CustomerAuthContext } from "@/types/express";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdatePrefsDto } from "./dto/update-prefs.dto";

@ApiTags("customers/me")
@Public()
@UseGuards(CustomerAuthGuard)
@ApiHeader({ name: "Authorization", required: true, description: "Bearer <customer-token>" })
@Controller("customers/me/notifications")
export class NotificationPrefsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("preferences")
  @ApiOperation({ summary: "Obtener preferencias de notificacion del cliente" })
  getPreferences(@CustomerAuth() auth: CustomerAuthContext) {
    return this.prisma.customerNotificationPref.findMany({
      where: {
        tenantId: auth.tenantId,
        customerId: auth.customerId,
      },
    });
  }

  @Patch("preferences")
  @ApiOperation({ summary: "Actualizar preferencias de notificacion del cliente" })
  async updatePreferences(
    @CustomerAuth() auth: CustomerAuthContext,
    @Body() dto: UpdatePrefsDto
  ) {
    const results = await Promise.all(
      dto.preferences.map((pref) =>
        this.prisma.customerNotificationPref.upsert({
          where: {
            tenantId_customerId_channel_event: {
              tenantId: auth.tenantId,
              customerId: auth.customerId,
              channel: pref.channel as any,
              event: pref.event,
            },
          },
          create: {
            tenantId: auth.tenantId,
            customerId: auth.customerId,
            channel: pref.channel as any,
            event: pref.event,
            enabled: pref.enabled,
          },
          update: {
            enabled: pref.enabled,
          },
        })
      )
    );

    return results;
  }
}
