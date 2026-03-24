import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreatePostAlertDto {
  @ApiProperty({ description: "ID del envío asociado", format: "uuid" })
  @IsUUID()
  shipmentId!: string;

  @ApiProperty({ description: "Número de tracking", maxLength: 64 })
  @IsString()
  @MaxLength(64)
  trackingNumber!: string;

  @ApiPropertyOptional({ description: "Nombre del destinatario" })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ description: "Nombre del remitente" })
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional({ description: "Carrier / transportista" })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ description: "Valor FOB declarado", minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fob?: number;

  @ApiPropertyOptional({ description: "Moneda", default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string = "USD";

  @ApiPropertyOptional({ description: "URL de la factura" })
  @IsOptional()
  @IsString()
  invoiceUrl?: string;

  @ApiPropertyOptional({ description: "Descripción del contenido", maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  content?: string;
}
