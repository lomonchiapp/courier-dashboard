import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "@/common/decorators/public.decorator";
import { BranchesService } from "./branches.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { ListBranchesQueryDto } from "./dto/list-branches-query.dto";

@ApiTags("branches")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("branches")
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Post()
  @ApiOperation({ summary: "Crear sucursal" })
  create(@Req() req: Request, @Body() dto: CreateBranchDto) {
    return this.branches.create(this.tenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: "Listar sucursales (paginado)" })
  list(@Req() req: Request, @Query() query: ListBranchesQueryDto) {
    return this.branches.list(
      this.tenantId(req),
      query.page,
      query.limit,
      query.type,
    );
  }

  @Public()
  @Get("public")
  @ApiOperation({ summary: "Listar sucursales activas (publico)" })
  @ApiHeader({ name: "X-Tenant-Id", required: true })
  listPublic(@Headers("x-tenant-id") tenantId: string) {
    return this.branches.listPublic(tenantId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de sucursal" })
  findOne(@Req() req: Request, @Param("id") id: string) {
    return this.branches.findOne(this.tenantId(req), id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar sucursal" })
  update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branches.update(this.tenantId(req), id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Desactivar sucursal (soft delete)" })
  remove(@Req() req: Request, @Param("id") id: string) {
    return this.branches.softDelete(this.tenantId(req), id);
  }
}
