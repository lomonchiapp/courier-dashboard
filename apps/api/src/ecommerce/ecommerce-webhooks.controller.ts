import {
  BadRequestException,
  Controller,
  Headers,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Request } from "express";
import { createHmac } from "crypto";
import { Public } from "@/common/decorators/public.decorator";
import { EcommerceService } from "./ecommerce.service";

/**
 * Public webhook receivers for e-commerce platforms.
 * Verified via HMAC signatures — no auth guard needed.
 */
@ApiExcludeController()
@Public()
@Controller("ecommerce-webhooks")
export class EcommerceWebhooksController {
  private readonly logger = new Logger(EcommerceWebhooksController.name);

  constructor(private readonly ecommerce: EcommerceService) {}

  @Post("shopify/:connectionId")
  async shopifyWebhook(
    @Param("connectionId") connectionId: string,
    @Headers("x-shopify-hmac-sha256") hmacHeader: string,
    @Headers("x-shopify-topic") topic: string,
    @Req() req: Request,
  ) {
    const connection = await this.ecommerce.findConnection(connectionId);

    if (!connection.isActive) {
      throw new NotFoundException("Connection is not active");
    }

    // Get raw body for HMAC verification
    const rawBody: string =
      (req as any).rawBody?.toString("utf8") ?? JSON.stringify(req.body);

    // Verify HMAC-SHA256 signature
    const computed = createHmac("sha256", connection.webhookSecret)
      .update(rawBody)
      .digest("base64");

    if (computed !== hmacHeader) {
      this.logger.warn(
        `Invalid Shopify webhook signature for connection ${connectionId}`,
      );
      throw new BadRequestException("Invalid webhook signature");
    }

    // Only process order creation/payment events
    if (
      topic !== "orders/create" &&
      topic !== "orders/paid" &&
      topic !== "orders/fulfilled"
    ) {
      this.logger.log(`Ignoring Shopify topic: ${topic}`);
      return { received: true, processed: false };
    }

    const order = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const result = await this.ecommerce.processShopifyOrder(
      connection.tenantId,
      connectionId,
      order,
    );

    return { received: true, processed: true, ...result };
  }

  @Post("woocommerce/:connectionId")
  async woocommerceWebhook(
    @Param("connectionId") connectionId: string,
    @Headers("x-wc-webhook-signature") signatureHeader: string,
    @Headers("x-wc-webhook-topic") topic: string,
    @Req() req: Request,
  ) {
    const connection = await this.ecommerce.findConnection(connectionId);

    if (!connection.isActive) {
      throw new NotFoundException("Connection is not active");
    }

    // Get raw body for HMAC verification
    const rawBody: string =
      (req as any).rawBody?.toString("utf8") ?? JSON.stringify(req.body);

    // Verify HMAC-SHA256 signature
    const computed = createHmac("sha256", connection.webhookSecret)
      .update(rawBody)
      .digest("base64");

    if (computed !== signatureHeader) {
      this.logger.warn(
        `Invalid WooCommerce webhook signature for connection ${connectionId}`,
      );
      throw new BadRequestException("Invalid webhook signature");
    }

    // Only process order creation events
    if (topic !== "order.created" && topic !== "order.updated") {
      this.logger.log(`Ignoring WooCommerce topic: ${topic}`);
      return { received: true, processed: false };
    }

    const order = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const result = await this.ecommerce.processWooCommerceOrder(
      connection.tenantId,
      connectionId,
      order,
    );

    return { received: true, processed: true, ...result };
  }
}
