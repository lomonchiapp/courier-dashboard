import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateCreditNoteDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ example: "Producto devuelto" })
  @IsString()
  @MaxLength(1000)
  reason!: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;
}
