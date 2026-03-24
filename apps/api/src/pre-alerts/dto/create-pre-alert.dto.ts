import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";

export class CreatePreAlertDto {
  @ApiProperty({ example: "1Z999AA10123456784", maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  trackingNumber!: string;

  @ApiPropertyOptional({ example: "UPS", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  carrier?: string;

  @ApiPropertyOptional({ example: "Amazon", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  store?: string;

  @ApiPropertyOptional({ example: "Electronics order", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 49.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({ example: "USD", default: "USD", maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string = "USD";

  @ApiPropertyOptional({ example: "Electronics", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: "https://example.com/invoice.pdf" })
  @IsOptional()
  @IsString()
  @IsUrl()
  invoiceUrl?: string;
}
