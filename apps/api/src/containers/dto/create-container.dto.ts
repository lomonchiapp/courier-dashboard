import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContainerType, ShippingMode } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateContainerDto {
  @ApiProperty({ example: "MSKU1234567", maxLength: 30 })
  @IsString()
  @MaxLength(30)
  number!: string;

  @ApiProperty({ enum: ContainerType })
  @IsEnum(ContainerType)
  type!: ContainerType;

  @ApiProperty({ enum: ShippingMode })
  @IsEnum(ShippingMode)
  mode!: ShippingMode;

  @ApiPropertyOptional({ example: "MIA" })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: "SDQ" })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voyageNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sealNumber?: string;

  @ApiPropertyOptional({ example: "2026-04-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  estimatedDeparture?: string;

  @ApiPropertyOptional({ example: "2026-04-10T00:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
