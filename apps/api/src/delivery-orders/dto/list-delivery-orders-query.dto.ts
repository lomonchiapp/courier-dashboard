import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export enum DeliveryOrderStatusFilter {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
}

export enum DeliveryTypeFilter {
  PICKUP = "PICKUP",
  HOME_DELIVERY = "HOME_DELIVERY",
  LOCKER = "LOCKER",
}

export class ListDeliveryOrdersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Filtrar por estado", enum: DeliveryOrderStatusFilter })
  @IsOptional()
  @IsEnum(DeliveryOrderStatusFilter)
  status?: DeliveryOrderStatusFilter;

  @ApiPropertyOptional({ description: "Filtrar por cliente", format: "uuid" })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: "Buscar por nombre de conductor" })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiPropertyOptional({ description: "Filtrar por tipo de entrega", enum: DeliveryTypeFilter })
  @IsOptional()
  @IsEnum(DeliveryTypeFilter)
  deliveryType?: DeliveryTypeFilter;

  @ApiPropertyOptional({ description: "Fecha desde (ISO)", example: "2025-01-01" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "Fecha hasta (ISO)", example: "2025-12-31" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
