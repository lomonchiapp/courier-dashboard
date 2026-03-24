import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateDgaLabelDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  shipmentId!: string;

  @ApiPropertyOptional({ example: "uuid" })
  @IsOptional()
  @IsUUID()
  containerId?: string;

  @ApiProperty({ example: "Juan Perez" })
  @IsString()
  consigneeName!: string;

  @ApiPropertyOptional({ example: "001-1234567-8" })
  @IsOptional()
  @IsString()
  consigneeCedula?: string;

  @ApiPropertyOptional({ example: "130123456" })
  @IsOptional()
  @IsString()
  consigneeRnc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consigneeAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consigneePhone?: string;

  @ApiProperty({ example: "BLX-90001234" })
  @IsString()
  trackingNumber!: string;

  @ApiProperty({ example: "Ropa y accesorios", maxLength: 500 })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({ example: "6204.62" })
  @IsOptional()
  @IsString()
  hsCode?: string;

  @ApiPropertyOptional({ example: "Textiles" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number = 1;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  @Min(0.01)
  weightLbs!: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0)
  fobValue!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string = "USD";

  @ApiProperty({ example: "US", maxLength: 3 })
  @IsString()
  @MaxLength(3)
  originCountry!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  regimeType?: string;
}
