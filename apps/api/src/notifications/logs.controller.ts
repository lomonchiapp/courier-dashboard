import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "@/prisma/prisma.service";
import { ListLogsQueryDto } from "./dto/list-logs-query.dto";

@ApiTags("notifications")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("notifications/logs")
export class LogsController {
  constructor(private readonly prisma: PrismaService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Get()
  @ApiOperation({ summary: "Listar logs de notificaciones (paginado)" })
  async list(@Req() req: Request, @Query() query: ListLogsQueryDto) {
    const tenantId = this.tenantId(req);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationLogWhereInput = { tenantId };
    if (query.event) where.event = query.event;
    if (query.channel) where.channel = query.channel as any;
    if (query.customerId) where.customerId = query.customerId;
    if (query.status) where.status = query.status as any;

    const [data, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
