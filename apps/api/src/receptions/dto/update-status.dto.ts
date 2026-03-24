import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

enum ReceptionStatusValue {
  PENDING = "PENDING",
  MEASURED = "MEASURED",
  CHARGED = "CHARGED",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  DELIVERED = "DELIVERED",
}

export class UpdateStatusDto {
  @ApiProperty({ enum: ReceptionStatusValue })
  @IsEnum(ReceptionStatusValue)
  status!: string;
}
