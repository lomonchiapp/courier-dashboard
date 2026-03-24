import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GenerateForContainerDto {
  @ApiProperty({ example: "uuid" })
  @IsUUID()
  containerId!: string;
}
