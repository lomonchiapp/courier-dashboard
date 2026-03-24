import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { CustomerAuth } from "@/common/decorators/customer-auth-context.decorator";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { InvoicesService } from "./invoices.service";
import { ListInvoicesQueryDto } from "./dto/list-invoices-query.dto";

@ApiTags("customers / self-service")
@Public()
@UseGuards(CustomerAuthGuard)
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "Authorization", required: true, description: "Customer Bearer token" })
@Controller("customers/me/invoices")
export class CustomerInvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: "List my invoices" })
  listMyInvoices(
    @CustomerAuth() auth: { tenantId: string; customerId: string },
    @Query() query: ListInvoicesQueryDto,
  ) {
    return this.invoices.listByCustomer(
      auth.tenantId,
      auth.customerId,
      query.page,
      query.limit,
    );
  }

  @Get("balance")
  @ApiOperation({ summary: "Get my outstanding balance" })
  getMyBalance(
    @CustomerAuth() auth: { tenantId: string; customerId: string },
  ) {
    return this.invoices.getCustomerBalance(auth.tenantId, auth.customerId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get my invoice detail" })
  findMyInvoice(
    @CustomerAuth() auth: { tenantId: string; customerId: string },
    @Param("id") id: string,
  ) {
    return this.invoices.findOne(auth.tenantId, id);
  }
}
