import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

@Injectable()
export class StripeGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private readonly secretKey: string | undefined;
  private readonly webhookSecret: string | undefined;
  private readonly baseUrl = "https://api.stripe.com";

  constructor(private readonly config: ConfigService) {
    this.secretKey = this.config.get<string>("stripe.secretKey");
    this.webhookSecret = this.config.get<string>("stripe.webhookSecret");

    if (!this.secretKey) {
      this.logger.warn(
        "STRIPE_SECRET_KEY is not configured — Stripe gateway will be unavailable",
      );
    }
  }

  private ensureConfigured(): void {
    if (!this.secretKey) {
      throw new ServiceUnavailableException(
        "Stripe gateway is not configured for this environment",
      );
    }
  }

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.secretKey}:`).toString("base64")}`;
  }

  async createIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ id: string; client_secret: string; status: string }> {
    this.ensureConfigured();

    const params = new URLSearchParams();
    params.append("amount", String(Math.round(amount * 100))); // Stripe uses cents
    params.append("currency", currency.toLowerCase());
    for (const [key, value] of Object.entries(metadata)) {
      params.append(`metadata[${key}]`, value);
    }

    const res = await fetch(`${this.baseUrl}/v1/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("Stripe createIntent failed", err);
      throw new ServiceUnavailableException(
        "Failed to create Stripe payment intent",
      );
    }

    const data = await res.json();
    return {
      id: data.id,
      client_secret: data.client_secret,
      status: data.status,
    };
  }

  async retrieveIntent(
    intentId: string,
  ): Promise<{ id: string; status: string; amount: number; currency: string }> {
    this.ensureConfigured();

    const res = await fetch(`${this.baseUrl}/v1/payment_intents/${intentId}`, {
      method: "GET",
      headers: { Authorization: this.authHeader() },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("Stripe retrieveIntent failed", err);
      throw new ServiceUnavailableException(
        "Failed to retrieve Stripe payment intent",
      );
    }

    const data = await res.json();
    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  }

  async cancelIntent(intentId: string): Promise<{ id: string; status: string }> {
    this.ensureConfigured();

    const res = await fetch(
      `${this.baseUrl}/v1/payment_intents/${intentId}/cancel`,
      {
        method: "POST",
        headers: { Authorization: this.authHeader() },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("Stripe cancelIntent failed", err);
      throw new ServiceUnavailableException(
        "Failed to cancel Stripe payment intent",
      );
    }

    const data = await res.json();
    return { id: data.id, status: data.status };
  }

  /**
   * Verify Stripe webhook signature using HMAC-SHA256.
   * Stripe-Signature header format: t=timestamp,v1=signature
   */
  verifyWebhookSignature(
    rawBody: Buffer | string,
    signatureHeader: string,
  ): boolean {
    if (!this.webhookSecret) {
      this.logger.warn("STRIPE_WEBHOOK_SECRET is not configured");
      return false;
    }

    try {
      const parts = signatureHeader.split(",");
      const timestamp = parts
        .find((p) => p.startsWith("t="))
        ?.replace("t=", "");
      const signature = parts
        .find((p) => p.startsWith("v1="))
        ?.replace("v1=", "");

      if (!timestamp || !signature) return false;

      // Reject if timestamp is older than 5 minutes
      const age = Math.floor(Date.now() / 1000) - Number(timestamp);
      if (age > 300) return false;

      const payload = `${timestamp}.${typeof rawBody === "string" ? rawBody : rawBody.toString("utf8")}`;
      const expected = createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      return timingSafeEqual(
        Buffer.from(expected, "hex"),
        Buffer.from(signature, "hex"),
      );
    } catch (err) {
      this.logger.error("Stripe signature verification error", err);
      return false;
    }
  }
}
