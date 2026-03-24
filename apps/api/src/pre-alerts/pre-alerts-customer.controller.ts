import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { CustomerAuth } from "@/common/decorators/customer-auth-context.decorator";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { CustomerAuthContext } from "@/types/express";
import { PreAlertsService } from "./pre-alerts.service";
import { CreatePreAlertDto } from "./dto/create-pre-alert.dto";
import { UpdatePreAlertDto } from "./dto/update-pre-alert.dto";
import { ListPreAlertsQueryDto } from "./dto/list-pre-alerts-query.dto";

@ApiTags("customers/me")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@Public()
@UseGuards(CustomerAuthGuard)
@Controller("customers/me/pre-alerts")
export class PreAlertsCustomerController {
  constructor(private readonly preAlerts: PreAlertsService) {}

  private async verifyOwnership(
    tenantId: string,
    id: string,
    customerId: string,
  ) {
    const preAlert = await this.preAlerts.findOne(tenantId, id);
    if (preAlert.customerId !== customerId) {
      throw new ForbiddenException(
        "You do not have access to this pre-alert",
      );
    }
    return preAlert;
  }

  @Post()
  @ApiOperation({ summary: "Crear pre-alerta (cliente)" })
  create(
    @CustomerAuth() auth: CustomerAuthContext,
    @Body() dto: CreatePreAlertDto,
  ) {
    return this.preAlerts.create(auth.tenantId, auth.customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar mis pre-alertas" })
  list(
    @CustomerAuth() auth: CustomerAuthContext,
    @Query() query: ListPreAlertsQueryDto,
  ) {
    return this.preAlerts.findByCustomer(
      auth.tenantId,
      auth.customerId,
      query.page,
      query.limit,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de mi pre-alerta" })
  async findOne(
    @CustomerAuth() auth: CustomerAuthContext,
    @Param("id") id: string,
  ) {
    await this.verifyOwnership(auth.tenantId, id, auth.customerId);
    return this.preAlerts.findOne(auth.tenantId, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar mi pre-alerta (solo si PENDING)" })
  async update(
    @CustomerAuth() auth: CustomerAuthContext,
    @Param("id") id: string,
    @Body() dto: UpdatePreAlertDto,
  ) {
    await this.verifyOwnership(auth.tenantId, id, auth.customerId);
    return this.preAlerts.update(auth.tenantId, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancelar mi pre-alerta" })
  async cancel(
    @CustomerAuth() auth: CustomerAuthContext,
    @Param("id") id: string,
  ) {
    await this.verifyOwnership(auth.tenantId, id, auth.customerId);
    return this.preAlerts.cancel(auth.tenantId, id);
  }
}
