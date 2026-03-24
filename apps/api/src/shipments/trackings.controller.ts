import { Controller, Get, Param, Req } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { ShipmentsService } from "./shipments.service";

@ApiTags("trackings")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@Controller("trackings")
export class TrackingsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get(":trackingNumber")
  @ApiOperation({
    summary: "Buscar envío por número de guía",
    description: "Mismo aislamiento por tenant que el resto de la API.",
  })
  findByTracking(@Req() req: Request, @Param("trackingNumber") trackingNumber: string) {
    return this.shipments.findByTrackingNumber(req.auth!.tenantId, trackingNumber);
  }
}
