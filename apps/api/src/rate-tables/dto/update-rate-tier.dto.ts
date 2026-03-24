import { PartialType } from "@nestjs/swagger";
import { CreateRateTierDto } from "./create-rate-tier.dto";

export class UpdateRateTierDto extends PartialType(CreateRateTierDto) {}
