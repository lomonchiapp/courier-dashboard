import { PartialType } from "@nestjs/swagger";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateConnectionDto } from "./create-connection.dto";

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {
  @ApiPropertyOptional({ description: "Enable or disable the connection" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
