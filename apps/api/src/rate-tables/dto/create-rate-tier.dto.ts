import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateRateTierDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  minWeight!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  maxWeight!: number;

  @ApiProperty({ example: 3.5 })
  @IsNumber()
  @Min(0)
  pricePerLb!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  flatFee?: number = 0;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string = "USD";
}
