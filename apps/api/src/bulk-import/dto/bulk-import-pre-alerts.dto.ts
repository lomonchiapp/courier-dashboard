import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class BulkPreAlertItemDto {
  @ApiProperty({ description: "Número de tracking" })
  @IsString()
  trackingNumber!: string;

  @ApiProperty({ description: "ID del cliente", format: "uuid" })
  @IsUUID()
  customerId!: string;

  @ApiPropertyOptional({ description: "Carrier / transportista" })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ description: "Tienda de origen" })
  @IsOptional()
  @IsString()
  store?: string;

  @ApiPropertyOptional({ description: "Descripción del contenido" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Valor estimado" })
  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional({ description: "Moneda", default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class BulkImportPreAlertsDto {
  @ApiProperty({ type: [BulkPreAlertItemDto], description: "Lista de pre-alertas a importar" })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkPreAlertItemDto)
  items!: BulkPreAlertItemDto[];
}
