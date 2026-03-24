import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { DgaLabelStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { CreateDgaLabelDto } from "./create-dga-label.dto";

export class UpdateDgaLabelDto extends PartialType(CreateDgaLabelDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dgaBarcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dgaManifestNumber?: string;

  @ApiPropertyOptional({ enum: DgaLabelStatus })
  @IsOptional()
  @IsEnum(DgaLabelStatus)
  status?: DgaLabelStatus;
}
