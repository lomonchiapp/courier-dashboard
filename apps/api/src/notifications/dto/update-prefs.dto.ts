import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class NotificationPrefItemDto {
  @ApiProperty({ example: "EMAIL" })
  @IsString()
  channel!: string;

  @ApiProperty({ example: "shipment.delivered" })
  @IsString()
  event!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled!: boolean;
}

export class UpdatePrefsDto {
  @ApiProperty({ type: [NotificationPrefItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationPrefItemDto)
  preferences!: NotificationPrefItemDto[];
}
