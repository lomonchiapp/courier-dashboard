import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CompleteDeliveryDto {
  @ApiPropertyOptional({ description: "Nombre del contacto que firma" })
  @IsOptional()
  @IsString()
  signatureContact?: string;

  @ApiPropertyOptional({ description: "Tipo de documento de identidad" })
  @IsOptional()
  @IsString()
  signatureIdType?: string;

  @ApiPropertyOptional({ description: "Número de documento de identidad" })
  @IsOptional()
  @IsString()
  signatureId?: string;

  @ApiPropertyOptional({ description: "URL de la firma digital" })
  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @ApiPropertyOptional({ description: "URL de la foto de entrega" })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: "Notas adicionales" })
  @IsOptional()
  @IsString()
  notes?: string;
}
