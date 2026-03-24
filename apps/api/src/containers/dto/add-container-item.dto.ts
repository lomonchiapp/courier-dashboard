import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class AddContainerItemDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  shipmentId!: string;

  @ApiPropertyOptional({ example: 5.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightLbs?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pieces?: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
