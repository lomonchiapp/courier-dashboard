import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class EstimateDto {
  @ApiProperty({ example: 5.5 })
  @IsNumber()
  @Min(0.01)
  weightLbs!: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthCm?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  widthCm?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @ApiPropertyOptional({ example: "US" })
  @IsOptional()
  @IsString()
  originZone?: string;

  @ApiPropertyOptional({ example: "PA" })
  @IsOptional()
  @IsString()
  destZone?: string;
}
