import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateShipmentDto {
  @ApiProperty({ example: "BLX-90001234" })
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  trackingNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(256)
  reference?: string;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "Metadatos libres (JSON)",
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
