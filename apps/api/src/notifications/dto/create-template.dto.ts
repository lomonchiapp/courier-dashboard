import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTemplateDto {
  @ApiProperty({ example: "shipment.delivered", maxLength: 100 })
  @IsString()
  @MaxLength(100)
  event!: string;

  @ApiProperty({ enum: ["EMAIL", "SMS", "PUSH", "WEBHOOK"] })
  @IsEnum(["EMAIL", "SMS", "PUSH", "WEBHOOK"], {
    message: "channel must be one of: EMAIL, SMS, PUSH, WEBHOOK",
  })
  channel!: "EMAIL" | "SMS" | "PUSH" | "WEBHOOK";

  @ApiPropertyOptional({ example: "Your package has arrived", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    example: "Hello {{customerName}}, your shipment {{trackingNumber}} has been delivered.",
    description: "Template body with {{variable}} placeholders",
  })
  @IsString()
  body!: string;
}
