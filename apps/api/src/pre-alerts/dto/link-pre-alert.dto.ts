import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class LinkPreAlertDto {
  @ApiProperty({ description: "Shipment ID to link this pre-alert to" })
  @IsUUID()
  shipmentId!: string;
}
