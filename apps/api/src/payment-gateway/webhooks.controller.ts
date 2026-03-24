import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "@/common/decorators/public.decorator";
import { PaymentGatewayService } from "./payment-gateway.service";

/**
 * Public webhook receivers for payment gateways.
 * These endpoints do NOT use any auth guard — they are verified via
 * gateway-specific signatures instead.
 *
 * NOTE: For Stripe webhooks, the raw request body is required for
 * signature verification. Ensure that main.ts includes the `rawBody: true`
 * option in NestFactory.create():
 *
 *   const app = await NestFactory.create(AppModule, { rawBody: true });
 *
 * With rawBody enabled, the raw body is available at (req as any).rawBody.
 */
@ApiExcludeController()
@Public()
@Controller("gateway-webhooks")
export class GatewayWebhooksController {
  constructor(private readonly gateway: PaymentGatewayService) {}

  @Post("stripe")
  async stripeWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException("Missing Stripe-Signature header");
    }

    // Access raw body for signature verification.
    // Requires `rawBody: true` in NestFactory.create() options.
    const rawBody: Buffer | string =
      (req as any).rawBody ?? JSON.stringify(req.body);

    return this.gateway.handleStripeWebhook(rawBody, signature);
  }

  @Post("paypal")
  async paypalWebhook(
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ) {
    // Access raw body for signature verification
    const rawBody: string =
      (req as any).rawBody?.toString("utf8") ?? JSON.stringify(req.body);

    return this.gateway.handlePaypalWebhook(headers, rawBody);
  }
}
