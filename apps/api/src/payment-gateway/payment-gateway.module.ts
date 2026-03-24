import { Module } from "@nestjs/common";
import { InvoicesModule } from "@/invoices/invoices.module";
import { StripeGateway } from "./gateways/stripe.gateway";
import { PayPalGateway } from "./gateways/paypal.gateway";
import { PaymentGatewayService } from "./payment-gateway.service";
import {
  CustomerPaymentIntentsController,
  PaymentIntentsController,
} from "./payment-gateway.controller";
import { GatewayWebhooksController } from "./webhooks.controller";

@Module({
  imports: [InvoicesModule],
  controllers: [
    CustomerPaymentIntentsController,
    PaymentIntentsController,
    GatewayWebhooksController,
  ],
  providers: [PaymentGatewayService, StripeGateway, PayPalGateway],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
