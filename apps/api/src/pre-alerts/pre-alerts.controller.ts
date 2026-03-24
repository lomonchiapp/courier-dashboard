import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { PreAlertsService } from "./pre-alerts.service";
import { ListPreAlertsQueryDto } from "./dto/list-pre-alerts-query.dto";
import { UpdatePreAlertDto } from "./dto/update-pre-alert.dto";
import { LinkPreAlertDto } from "./dto/link-pre-alert.dto";

@ApiTags("pre-alerts")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("pre-alerts")
export class PreAlertsController {
  constructor(private readonly preAlerts: PreAlertsService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Get()
  @ApiOperation({ summary: "Listar pre-alertas (paginado, con filtros)" })
  list(@Req() req: Request, @Query() query: ListPreAlertsQueryDto) {
    return this.preAlerts.list(this.tenantId(req), query.page, query.limit, {
      status: query.status,
      customerId: query.customerId,
    });
  }

  @Get("unmatched")
  @ApiOperation({ summary: "Listar pre-alertas sin enlazar a envio" })
  listUnmatched(@Req() req: Request, @Query() query: ListPreAlertsQueryDto) {
    return this.preAlerts.listUnmatched(
      this.tenantId(req),
      query.page,
      query.limit,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de pre-alerta" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.preAlerts.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar pre-alerta (solo si PENDING)" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdatePreAlertDto,
  ) {
    return this.preAlerts.update(this.tenantId(req), id, dto);
  }

  @Post(":id/link")
  @ApiOperation({ summary: "Enlazar pre-alerta a un envio" })
  linkToShipment(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: LinkPreAlertDto,
  ) {
    return this.preAlerts.linkToShipment(
      this.tenantId(req),
      id,
      dto.shipmentId,
    );
  }
}
