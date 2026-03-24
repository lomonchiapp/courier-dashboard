import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class FailDeliveryDto {
  @ApiProperty({ description: "Razón del fallo", maxLength: 500 })
  @IsString()
  @MaxLength(500)
  failReason!: string;

  @ApiPropertyOptional({ description: "Notas adicionales" })
  @IsOptional()
  @IsString()
  notes?: string;
}
