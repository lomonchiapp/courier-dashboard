import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { ListCustomersQueryDto } from "./dto/list-customers-query.dto";

@ApiTags("customers")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("customers")
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear cliente (operador)" })
  create(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    return this.customers.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar clientes (paginado, con busqueda)" })
  list(@Req() req: Request, @Query() query: ListCustomersQueryDto) {
    return this.customers.list(
      this.tenantId(req),
      query.page,
      query.limit,
      query.search
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de cliente" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.customers.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar cliente" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto
  ) {
    return this.customers.update(this.tenantId(req), id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Desactivar cliente (soft delete)" })
  softDelete(@Req() req: Request, @Param("id") id: string) {
    return this.customers.softDelete(this.tenantId(req), id);
  }

  @Get(":id/shipments")
  @ApiOperation({ summary: "Listar envios de un cliente" })
  listShipments(
    @Req() req: Request,
    @Param("id") id: string,
    @Query() query: ListCustomersQueryDto
  ) {
    return this.customers.listShipments(
      this.tenantId(req),
      id,
      query.page,
      query.limit
    );
  }
}
