import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: "Nota actualizada" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTermDays?: number;

  @ApiPropertyOptional({ example: "B01" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fiscalType?: string;
}
