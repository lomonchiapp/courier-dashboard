import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class BulkCustomerItemDto {
  @ApiProperty({ description: "Email del cliente" })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: "Nombre" })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: "Apellido" })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({ description: "Teléfono" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Tipo de documento" })
  @IsOptional()
  @IsString()
  idType?: string;

  @ApiPropertyOptional({ description: "Número de documento" })
  @IsOptional()
  @IsString()
  idNumber?: string;
}

export class BulkImportCustomersDto {
  @ApiProperty({ type: [BulkCustomerItemDto], description: "Lista de clientes a importar" })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkCustomerItemDto)
  items!: BulkCustomerItemDto[];
}
