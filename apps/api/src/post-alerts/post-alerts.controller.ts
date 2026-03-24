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
import { PostAlertsService } from "./post-alerts.service";
import { CreatePostAlertDto } from "./dto/create-post-alert.dto";
import { UpdatePostAlertDto } from "./dto/update-post-alert.dto";
import { ListPostAlertsQueryDto } from "./dto/list-post-alerts-query.dto";

@ApiTags("post-alerts")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("post-alerts")
export class PostAlertsController {
  constructor(private readonly postAlerts: PostAlertsService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear post-alerta" })
  create(@Req() req: Request, @Body() dto: CreatePostAlertDto) {
    return this.postAlerts.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar post-alertas (paginado)" })
  list(@Req() req: Request, @Query() query: ListPostAlertsQueryDto) {
    return this.postAlerts.list(this.tenantId(req), query.page, query.limit, {
      customerId: query.customerId,
      shipmentId: query.shipmentId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de post-alerta" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.postAlerts.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar post-alerta" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdatePostAlertDto,
  ) {
    return this.postAlerts.update(this.tenantId(req), id, dto);
  }
}
