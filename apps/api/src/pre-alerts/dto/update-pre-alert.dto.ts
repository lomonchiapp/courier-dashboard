import { PartialType } from "@nestjs/swagger";
import { CreatePreAlertDto } from "./create-pre-alert.dto";

export class UpdatePreAlertDto extends PartialType(CreatePreAlertDto) {}
