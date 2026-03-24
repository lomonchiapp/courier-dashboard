import { PartialType } from "@nestjs/swagger";
import { CreateRateTableDto } from "./create-rate-table.dto";

export class UpdateRateTableDto extends PartialType(CreateRateTableDto) {}
