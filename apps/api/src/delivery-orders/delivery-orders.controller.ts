import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { DeliveryOrdersService } from "./delivery-orders.service";
import { CreateDeliveryOrderDto } from "./dto/create-delivery-order.dto";
import { AssignDriverDto } from "./dto/assign-driver.dto";
import { CompleteDeliveryDto } from "./dto/complete-delivery.dto";
import { FailDeliveryDto } from "./dto/fail-delivery.dto";
import { ListDeliveryOrdersQueryDto } from "./dto/list-delivery-orders-query.dto";

@ApiTags("delivery-orders")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("delivery-orders")
export class DeliveryOrdersController {
  constructor(private readonly deliveryOrders: DeliveryOrdersService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear orden de entrega" })
  create(@Req() req: Request, @Body() dto: CreateDeliveryOrderDto) {
    return this.deliveryOrders.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar órdenes de entrega (paginado)" })
  list(@Req() req: Request, @Query() query: ListDeliveryOrdersQueryDto) {
    return this.deliveryOrders.list(this.tenantId(req), query.page, query.limit, {
      status: query.status,
      customerId: query.customerId,
      driverName: query.driverName,
      deliveryType: query.deliveryType,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de orden de entrega" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.deliveryOrders.findOne(this.tenantId(req), id);
  }

  @Post(":id/assign")
  @ApiOperation({ summary: "Asignar conductor a la orden" })
  assignDriver(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: AssignDriverDto,
  ) {
    return this.deliveryOrders.assignDriver(this.tenantId(req), id, dto);
  }

  @Post(":id/start")
  @ApiOperation({ summary: "Iniciar entrega (recoger paquete)" })
  startDelivery(@Req() req: Request, @Param("id") id: string) {
    return this.deliveryOrders.startDelivery(this.tenantId(req), id);
  }

  @Post(":id/complete")
  @ApiOperation({ summary: "Completar entrega" })
  completeDelivery(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: CompleteDeliveryDto,
  ) {
    return this.deliveryOrders.completeDelivery(this.tenantId(req), id, dto);
  }

  @Post(":id/fail")
  @ApiOperation({ summary: "Marcar entrega como fallida" })
  failDelivery(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: FailDeliveryDto,
  ) {
    return this.deliveryOrders.failDelivery(this.tenantId(req), id, dto);
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancelar orden de entrega" })
  cancel(@Req() req: Request, @Param("id") id: string) {
    return this.deliveryOrders.cancel(this.tenantId(req), id);
  }
}
