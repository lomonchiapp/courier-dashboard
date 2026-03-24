import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateRateTableDto {
  @ApiProperty({ example: "Standard US-PA" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: "US" })
  @IsOptional()
  @IsString()
  originZone?: string;

  @ApiPropertyOptional({ example: "PA" })
  @IsOptional()
  @IsString()
  destZone?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
