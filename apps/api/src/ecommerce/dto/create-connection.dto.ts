import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

enum EcommercePlatformEnum {
  SHOPIFY = "SHOPIFY",
  WOOCOMMERCE = "WOOCOMMERCE",
}

export class CreateConnectionDto {
  @ApiProperty({ enum: EcommercePlatformEnum, description: "E-commerce platform" })
  @IsEnum(EcommercePlatformEnum)
  platform!: "SHOPIFY" | "WOOCOMMERCE";

  @ApiProperty({ example: "mystore.myshopify.com", description: "Shop domain" })
  @IsString()
  @MaxLength(255)
  shopDomain!: string;

  @ApiProperty({ description: "Webhook secret for signature verification", minLength: 16 })
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  webhookSecret!: string;

  @ApiPropertyOptional({ description: "API key for the platform" })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  apiKey?: string;
}
