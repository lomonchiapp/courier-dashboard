import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";

enum PaymentGatewayFilter {
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
}

enum PaymentIntentStatusFilter {
  CREATED = "CREATED",
  REQUIRES_PAYMENT_METHOD = "REQUIRES_PAYMENT_METHOD",
  REQUIRES_CONFIRMATION = "REQUIRES_CONFIRMATION",
  REQUIRES_ACTION = "REQUIRES_ACTION",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export class ListPaymentIntentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ enum: PaymentGatewayFilter })
  @IsOptional()
  @IsEnum(PaymentGatewayFilter)
  gateway?: PaymentGatewayFilter;

  @ApiPropertyOptional({ enum: PaymentIntentStatusFilter })
  @IsOptional()
  @IsEnum(PaymentIntentStatusFilter)
  status?: PaymentIntentStatusFilter;
}
