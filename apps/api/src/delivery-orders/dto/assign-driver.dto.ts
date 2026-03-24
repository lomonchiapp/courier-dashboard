import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class AssignDriverDto {
  @ApiProperty({ description: "Nombre del conductor" })
  @IsString()
  driverName!: string;

  @ApiPropertyOptional({ description: "Teléfono del conductor" })
  @IsOptional()
  @IsString()
  driverPhone?: string;

  @ApiPropertyOptional({ description: "Vehículo del conductor" })
  @IsOptional()
  @IsString()
  driverVehicle?: string;
}
