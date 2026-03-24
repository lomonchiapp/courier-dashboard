import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsISO8601, IsOptional, IsUUID } from "class-validator";

export enum AnalyticsPeriod {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: "Start date (ISO 8601)", example: "2026-01-01" })
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "End date (ISO 8601)", example: "2026-03-31" })
  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  @ApiPropertyOptional({ description: "Time series grouping period", enum: AnalyticsPeriod, default: AnalyticsPeriod.DAY })
  @IsOptional()
  @IsEnum(AnalyticsPeriod)
  period?: AnalyticsPeriod = AnalyticsPeriod.DAY;

  @ApiPropertyOptional({ description: "Filter by branch ID" })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: "Filter by customer ID" })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
