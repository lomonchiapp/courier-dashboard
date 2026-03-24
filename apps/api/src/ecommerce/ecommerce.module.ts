import { Module } from "@nestjs/common";
import { EcommerceService } from "./ecommerce.service";
import { EcommerceController } from "./ecommerce.controller";
import { EcommerceWebhooksController } from "./ecommerce-webhooks.controller";

@Module({
  controllers: [EcommerceController, EcommerceWebhooksController],
  providers: [EcommerceService],
  exports: [EcommerceService],
})
export class EcommerceModule {}
