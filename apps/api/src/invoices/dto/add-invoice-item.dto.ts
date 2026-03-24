import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class AddInvoiceItemDto {
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

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPct?: number;

  @ApiPropertyOptional({ example: 18 })
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
