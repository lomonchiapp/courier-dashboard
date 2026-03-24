import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class AddChargeDto {
  @ApiProperty({ example: "Handling fee" })
  @IsString()
  @MaxLength(200)
  description!: string;

  @ApiProperty({ example: 12.5 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string = "USD";
}
