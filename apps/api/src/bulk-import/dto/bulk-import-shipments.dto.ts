import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class BulkShipmentItemDto {
  @ApiProperty({ description: "Número de tracking" })
  @IsString()
  trackingNumber!: string;

  @ApiPropertyOptional({ description: "Referencia" })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: "ID del cliente", format: "uuid" })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ description: "Metadatos libres" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class BulkImportShipmentsDto {
  @ApiProperty({ type: [BulkShipmentItemDto], description: "Lista de envíos a importar" })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkShipmentItemDto)
  items!: BulkShipmentItemDto[];
}
