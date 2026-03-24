import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class CreateInvoiceItemDto {
  @ApiProperty({ example: "Flete internacional" })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ example: 25.0 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 0, description: "Discount percentage 0-100" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPct?: number;

  @ApiPropertyOptional({ example: 18, description: "Tax percentage 0-100" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  receptionId?: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  customerId!: string;

  @ApiPropertyOptional({ example: "USD", default: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @ApiPropertyOptional({ example: 30, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTermDays?: number;

  @ApiPropertyOptional({ example: "Favor pagar antes de la fecha de vencimiento" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: "B01" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fiscalType?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items!: CreateInvoiceItemDto[];
}
