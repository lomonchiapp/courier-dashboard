import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { UpdateTemplateDto } from "./dto/update-template.dto";

@ApiTags("notifications")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("notifications/templates")
export class TemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear plantilla de notificacion" })
  create(@Req() req: Request, @Body() dto: CreateTemplateDto) {
    const tenantId = this.tenantId(req);
    return this.prisma.notificationTemplate.create({
      data: {
        tenantId,
        event: dto.event,
        channel: dto.channel as any,
        subject: dto.subject,
        body: dto.body,
      },
    });
  }

  @Get()
  @ApiOperation({ summary: "Listar plantillas de notificacion" })
  list(@Req() req: Request) {
    const tenantId = this.tenantId(req);
    return this.prisma.notificationTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar plantilla de notificacion" })
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateTemplateDto
  ) {
    const tenantId = this.tenantId(req);
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException("Template not found");

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...(dto.event !== undefined && { event: dto.event }),
        ...(dto.channel !== undefined && { channel: dto.channel as any }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
      },
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar plantilla de notificacion" })
  async remove(@Req() req: Request, @Param("id") id: string) {
    const tenantId = this.tenantId(req);
    const existing = await this.prisma.notificationTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException("Template not found");

    await this.prisma.notificationTemplate.delete({ where: { id } });
    return { deleted: true };
  }
}
