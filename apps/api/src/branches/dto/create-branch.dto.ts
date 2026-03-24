import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ description: "Short code like MIA-WH1" })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiPropertyOptional({
    enum: ["WAREHOUSE", "PICKUP_POINT", "OFFICE", "SORTING_CENTER"],
    default: "WAREHOUSE",
  })
  @IsOptional()
  @IsEnum(["WAREHOUSE", "PICKUP_POINT", "OFFICE", "SORTING_CENTER"])
  type?: string;

  @ApiProperty({ description: "Structured address object" })
  @IsObject()
  address!: Record<string, unknown>;

  @ApiPropertyOptional({ description: "{ lat, lng }" })
  @IsOptional()
  @IsObject()
  coordinates?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: "Operating hours by day" })
  @IsOptional()
  @IsObject()
  hours?: Record<string, unknown>;
}
