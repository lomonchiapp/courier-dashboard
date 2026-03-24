import { ApiProperty } from "@nestjs/swagger";
import { DgaLabelStatus } from "@prisma/client";
import { IsArray, IsEnum, IsUUID } from "class-validator";

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [String], example: ["uuid1", "uuid2"] })
  @IsArray()
  @IsUUID("4", { each: true })
  ids!: string[];

  @ApiProperty({ enum: DgaLabelStatus })
  @IsEnum(DgaLabelStatus)
  status!: DgaLabelStatus;
}
