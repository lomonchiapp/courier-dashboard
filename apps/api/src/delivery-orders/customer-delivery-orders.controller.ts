import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { CustomerAuth } from "@/common/decorators/customer-auth-context.decorator";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { CustomerAuthContext } from "@/types/express";
import { DeliveryOrdersService } from "./delivery-orders.service";
import { ListDeliveryOrdersQueryDto } from "./dto/list-delivery-orders-query.dto";

@ApiTags("customers/me")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@Public()
@UseGuards(CustomerAuthGuard)
@Controller("customers/me/delivery-orders")
export class CustomerDeliveryOrdersController {
  constructor(private readonly deliveryOrders: DeliveryOrdersService) {}

  @Get()
  @ApiOperation({ summary: "Listar mis órdenes de entrega" })
  list(
    @CustomerAuth() auth: CustomerAuthContext,
    @Query() query: ListDeliveryOrdersQueryDto,
  ) {
    return this.deliveryOrders.listByCustomer(
      auth.tenantId,
      auth.customerId,
      query.page,
      query.limit,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de mi orden de entrega" })
  async findOne(
    @CustomerAuth() auth: CustomerAuthContext,
    @Param("id") id: string,
  ) {
    const order = await this.deliveryOrders.findOne(auth.tenantId, id);
    if (order.customerId !== auth.customerId) {
      throw new ForbiddenException(
        "You do not have access to this delivery order",
      );
    }
    return order;
  }
}
