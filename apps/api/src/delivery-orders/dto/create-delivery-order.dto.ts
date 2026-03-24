import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export enum DeliveryType {
  PICKUP = "PICKUP",
  HOME_DELIVERY = "HOME_DELIVERY",
  LOCKER = "LOCKER",
}

export class DeliveryCoordsDto {
  @ApiProperty({ description: "Latitud" })
  @IsNumber()
  lat!: number;

  @ApiProperty({ description: "Longitud" })
  @IsNumber()
  lng!: number;
}

export class CreateDeliveryOrderDto {
  @ApiProperty({ description: "ID del envío asociado", format: "uuid" })
  @IsUUID()
  shipmentId!: string;

  @ApiPropertyOptional({ description: "ID del cliente", format: "uuid" })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({
    description: "Tipo de entrega",
    enum: DeliveryType,
    example: DeliveryType.HOME_DELIVERY,
  })
  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;

  @ApiPropertyOptional({
    description: "Dirección de entrega (para HOME_DELIVERY)",
  })
  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "Coordenadas de entrega" })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryCoordsDto)
  deliveryCoords?: DeliveryCoordsDto;

  @ApiPropertyOptional({
    description: "ID de la sucursal de retiro (para PICKUP)",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  pickupBranchId?: string;

  @ApiPropertyOptional({ description: "Fecha programada (ISO)" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: "Notas adicionales" })
  @IsOptional()
  @IsString()
  notes?: string;
}
