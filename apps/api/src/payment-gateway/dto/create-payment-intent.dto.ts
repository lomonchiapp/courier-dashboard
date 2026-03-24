import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

enum PaymentGatewayEnum {
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
}

export class CreatePaymentIntentDto {
  @ApiProperty({ example: "uuid", description: "Invoice to pay" })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ enum: PaymentGatewayEnum, description: "Payment gateway to use" })
  @IsEnum(PaymentGatewayEnum)
  gateway!: "STRIPE" | "PAYPAL";

  @ApiPropertyOptional({ example: "USD", default: "USD" })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: "Return URL for redirect-based flows" })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  returnUrl?: string;
}
