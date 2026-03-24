import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class ListLogsQueryDto {
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

  @ApiPropertyOptional({ example: "shipment.delivered" })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({ enum: ["EMAIL", "SMS", "PUSH", "WEBHOOK"] })
  @IsOptional()
  @IsEnum(["EMAIL", "SMS", "PUSH", "WEBHOOK"])
  channel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ enum: ["PENDING", "SENT", "FAILED"] })
  @IsOptional()
  @IsEnum(["PENDING", "SENT", "FAILED"])
  status?: string;
}
