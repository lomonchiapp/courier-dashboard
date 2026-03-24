import { PartialType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { CreatePostAlertDto } from "./create-post-alert.dto";

export class UpdatePostAlertDto extends PartialType(CreatePostAlertDto) {
  @ApiPropertyOptional({ description: "Valor FOB declarado", minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  declare fob?: number;

  @ApiPropertyOptional({ description: "URL de la factura" })
  @IsOptional()
  @IsString()
  declare invoiceUrl?: string;
}
