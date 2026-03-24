import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
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
import { CustomerAuthService } from "./customer-auth.service";
import { CustomersService } from "./customers.service";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { LoginCustomerDto } from "./dto/login-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { ListCustomersQueryDto } from "./dto/list-customers-query.dto";

@ApiTags("customers / self-service")
@Public()
@UseGuards(CustomerAuthGuard)
@Controller("customers")
export class CustomersMeController {
  constructor(
    private readonly authService: CustomerAuthService,
    private readonly customers: CustomersService
  ) {}

  @Post("register")
  @Public()
  @ApiOperation({ summary: "Registro de cliente" })
  @ApiHeader({ name: "X-Tenant-Id", required: true })
  register(
    @Headers("x-tenant-id") tenantId: string,
    @Body() dto: RegisterCustomerDto
  ) {
    if (!tenantId) {
      throw new BadRequestException("X-Tenant-Id header is required");
    }
    return this.authService.register(tenantId, dto);
  }

  @Post("login")
  @Public()
  @ApiOperation({ summary: "Login de cliente" })
  @ApiHeader({ name: "X-Tenant-Id", required: true })
  login(
    @Headers("x-tenant-id") tenantId: string,
    @Body() dto: LoginCustomerDto
  ) {
    if (!tenantId) {
      throw new BadRequestException("X-Tenant-Id header is required");
    }
    return this.authService.login(tenantId, dto.email, dto.password);
  }

  @Get("me")
  @ApiOperation({ summary: "Perfil del cliente autenticado" })
  getProfile(@CustomerAuth() auth: CustomerAuthContext) {
    return this.customers.findOne(auth.tenantId, auth.customerId);
  }

  @Patch("me")
  @ApiOperation({ summary: "Actualizar perfil propio" })
  updateProfile(
    @CustomerAuth() auth: CustomerAuthContext,
    @Body() dto: UpdateCustomerDto
  ) {
    return this.customers.update(auth.tenantId, auth.customerId, dto);
  }

  @Get("me/shipments")
  @ApiOperation({ summary: "Listar envios propios" })
  listMyShipments(
    @CustomerAuth() auth: CustomerAuthContext,
    @Query() query: ListCustomersQueryDto
  ) {
    return this.customers.listShipments(
      auth.tenantId,
      auth.customerId,
      query.page,
      query.limit
    );
  }
}
