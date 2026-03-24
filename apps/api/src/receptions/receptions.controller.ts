import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "@/common/decorators/public.decorator";
import { CustomerAuth } from "@/common/decorators/customer-auth-context.decorator";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { ReceptionsService } from "./receptions.service";
import { CreateReceptionDto } from "./dto/create-reception.dto";
import { UpdateReceptionDto } from "./dto/update-reception.dto";
import { AddChargeDto } from "./dto/add-charge.dto";
import { ListReceptionsQueryDto } from "./dto/list-receptions-query.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

@ApiTags("receptions")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("receptions")
export class ReceptionsController {
  constructor(private readonly receptions: ReceptionsService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear recepción de paquete" })
  create(@Req() req: Request, @Body() dto: CreateReceptionDto) {
    return this.receptions.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar recepciones (paginado, con filtros)" })
  list(@Req() req: Request, @Query() query: ListReceptionsQueryDto) {
    return this.receptions.list(this.tenantId(req), query.page, query.limit, {
      branchId: query.branchId,
      status: query.status,
      customerId: query.customerId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de recepción" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.receptions.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar recepción" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateReceptionDto,
  ) {
    return this.receptions.update(this.tenantId(req), id, dto);
  }

  @Post(":id/charges")
  @ApiOperation({ summary: "Agregar cargo a recepción" })
  addCharge(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: AddChargeDto,
  ) {
    return this.receptions.addCharge(this.tenantId(req), id, dto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Actualizar estado de recepción" })
  updateStatus(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.receptions.updateStatus(this.tenantId(req), id, dto.status);
  }
}

@ApiTags("customers / self-service")
@Public()
@UseGuards(CustomerAuthGuard)
@Controller("customers")
export class CustomerReceptionsController {
  constructor(private readonly receptions: ReceptionsService) {}

  @Get("me/receptions")
  @ApiOperation({ summary: "Listar recepciones del cliente autenticado" })
  listMyReceptions(
    @CustomerAuth() auth: { tenantId: string; customerId: string },
    @Query() query: ListReceptionsQueryDto,
  ) {
    return this.receptions.listByCustomer(
      auth.tenantId,
      auth.customerId,
      query.page,
      query.limit,
    );
  }
}
