import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiPropertyOptional, ApiResponse, ApiTags } from "@nestjs/swagger";
import { IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { Type } from "class-transformer";
import { Request } from "express";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsQueryDto } from "./dto/analytics-query.dto";

class TopCustomersQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: "Max results to return", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

class DgaQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: "Filter by container ID" })
  @IsOptional()
  @IsUUID()
  containerId?: string;
}

@ApiTags("analytics")
@ApiHeader({ name: "X-Tenant-Id", required: true })
@ApiHeader({ name: "X-Api-Key", required: false, description: "Si no usas Bearer JWT" })
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  private tenantId(req: Request): string {
    return req.auth!.tenantId;
  }

  @Get("overview")
  @ApiOperation({ summary: "Dashboard overview with key metrics" })
  @ApiResponse({ status: 200, description: "Overview metrics" })
  getOverview(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getOverview(this.tenantId(req), query.dateFrom, query.dateTo);
  }

  @Get("shipments/by-phase")
  @ApiOperation({ summary: "Shipments grouped by current phase" })
  @ApiResponse({ status: 200, description: "Shipment counts per phase" })
  getShipmentsByPhase(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getShipmentsByPhase(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
    );
  }

  @Get("shipments/time-series")
  @ApiOperation({ summary: "Shipments created/delivered over time" })
  @ApiResponse({ status: 200, description: "Time series of shipment counts" })
  getShipmentTimeSeries(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getShipmentTimeSeries(
      this.tenantId(req),
      query.dateFrom!,
      query.dateTo!,
      query.period,
    );
  }

  @Get("revenue/time-series")
  @ApiOperation({ summary: "Revenue invoiced and collected over time" })
  @ApiResponse({ status: 200, description: "Time series of revenue" })
  getRevenueTimeSeries(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getRevenueTimeSeries(
      this.tenantId(req),
      query.dateFrom!,
      query.dateTo!,
      query.period,
    );
  }

  @Get("customers/top")
  @ApiOperation({ summary: "Top customers by shipment volume and revenue" })
  @ApiResponse({ status: 200, description: "Ranked list of top customers" })
  getTopCustomers(@Req() req: Request, @Query() query: TopCustomersQueryDto) {
    return this.analytics.getTopCustomers(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
      query.limit,
    );
  }

  @Get("receptions/by-branch")
  @ApiOperation({ summary: "Receptions grouped by branch" })
  @ApiResponse({ status: 200, description: "Reception counts and totals per branch" })
  getReceptionsByBranch(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getReceptionsByBranch(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
    );
  }

  @Get("containers")
  @ApiOperation({ summary: "Container analytics (modes, statuses, transit times)" })
  @ApiResponse({ status: 200, description: "Container statistics" })
  getContainerStats(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getContainerStats(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
    );
  }

  @Get("delivery-performance")
  @ApiOperation({ summary: "Delivery order performance metrics" })
  @ApiResponse({ status: 200, description: "Delivery performance stats" })
  getDeliveryPerformance(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getDeliveryPerformance(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
    );
  }

  @Get("dga")
  @ApiOperation({ summary: "DGA / customs labels summary" })
  @ApiResponse({ status: 200, description: "DGA label statistics" })
  getDgaSummary(@Req() req: Request, @Query() query: DgaQueryDto) {
    return this.analytics.getDgaSummary(
      this.tenantId(req),
      query.containerId,
      query.dateFrom,
      query.dateTo,
    );
  }

  @Get("payment-methods")
  @ApiOperation({ summary: "Payment method usage breakdown" })
  @ApiResponse({ status: 200, description: "Payment counts and totals per method" })
  getPaymentMethodBreakdown(@Req() req: Request, @Query() query: AnalyticsQueryDto) {
    return this.analytics.getPaymentMethodBreakdown(
      this.tenantId(req),
      query.dateFrom,
      query.dateTo,
    );
  }
}
