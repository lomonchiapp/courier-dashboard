import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { IdDocType } from "./register-customer.dto";

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: "John", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: "Doe", maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: "+1809555000" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: IdDocType })
  @IsOptional()
  @IsEnum(IdDocType)
  idType?: IdDocType;

  @ApiPropertyOptional({ example: "001-1234567-8", maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  idNumber?: string;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    description: "Customer address data",
  })
  @IsOptional()
  @IsObject()
  address?: Record<string, unknown>;
}
