import { ApiProperty } from "@nestjs/swagger";
import { ContainerStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class TransitionStatusDto {
  @ApiProperty({ enum: ContainerStatus })
  @IsEnum(ContainerStatus)
  status!: ContainerStatus;
}
