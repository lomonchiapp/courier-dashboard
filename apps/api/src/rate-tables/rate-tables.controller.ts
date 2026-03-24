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
import { RateTablesService } from "./rate-tables.service";
import { CreateRateTableDto } from "./dto/create-rate-table.dto";
import { UpdateRateTableDto } from "./dto/update-rate-table.dto";
import { CreateRateTierDto } from "./dto/create-rate-tier.dto";
import { UpdateRateTierDto } from "./dto/update-rate-tier.dto";
import { ListRateTablesQueryDto } from "./dto/list-rate-tables-query.dto";

@ApiTags("rate-tables")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("rate-tables")
export class RateTablesController {
  constructor(private readonly rateTables: RateTablesService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear tabla de tarifas" })
  create(@Req() req: Request, @Body() dto: CreateRateTableDto) {
    return this.rateTables.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar tablas de tarifas" })
  list(@Req() req: Request, @Query() query: ListRateTablesQueryDto) {
    return this.rateTables.list(this.tenantId(req), query.page, query.limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de tabla de tarifas con tiers" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.rateTables.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar tabla de tarifas" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateRateTableDto,
  ) {
    return this.rateTables.update(this.tenantId(req), id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar tabla de tarifas" })
  remove(@Req() req: Request, @Param("id") id: string) {
    return this.rateTables.remove(this.tenantId(req), id);
  }

  // ── Tiers ──

  @Post(":id/tiers")
  @ApiOperation({ summary: "Agregar tier a tabla de tarifas" })
  addTier(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: CreateRateTierDto,
  ) {
    return this.rateTables.addTier(this.tenantId(req), id, dto);
  }

  @Patch(":id/tiers/:tierId")
  @ApiOperation({ summary: "Actualizar tier" })
  updateTier(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("tierId") tierId: string,
    @Body() dto: UpdateRateTierDto,
  ) {
    return this.rateTables.updateTier(this.tenantId(req), id, tierId, dto);
  }

  @Delete(":id/tiers/:tierId")
  @ApiOperation({ summary: "Eliminar tier" })
  removeTier(
    @Req() req: Request,
    @Param("id") id: string,
    @Param("tierId") tierId: string,
  ) {
    return this.rateTables.removeTier(this.tenantId(req), id, tierId);
  }
}
