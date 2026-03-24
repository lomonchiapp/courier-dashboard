import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class PayPalGateway {
  private readonly logger = new Logger(PayPalGateway.name);
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly webhookId: string | undefined;
  private readonly baseUrl = "https://api-m.sandbox.paypal.com";
  private cachedToken: CachedToken | null = null;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>("paypal.clientId");
    this.clientSecret = this.config.get<string>("paypal.clientSecret");
    this.webhookId = this.config.get<string>("paypal.webhookId");

    if (!this.clientId || !this.clientSecret) {
      this.logger.warn(
        "PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured — PayPal gateway will be unavailable",
      );
    }
  }

  private ensureConfigured(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new ServiceUnavailableException(
        "PayPal gateway is not configured for this environment",
      );
    }
  }

  async getAccessToken(): Promise<string> {
    this.ensureConfigured();

    // Return cached token if still valid (with 60s buffer)
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60_000) {
      return this.cachedToken.accessToken;
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString("base64");

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("PayPal getAccessToken failed", err);
      throw new ServiceUnavailableException(
        "Failed to obtain PayPal access token",
      );
    }

    const data = await res.json();
    this.cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return data.access_token;
  }

  async createOrder(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<{ id: string; links: Array<{ href: string; rel: string }> }> {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
            custom_id: metadata.paymentIntentId ?? "",
            description: metadata.description ?? "Payment",
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("PayPal createOrder failed", err);
      throw new ServiceUnavailableException(
        "Failed to create PayPal order",
      );
    }

    const data = await res.json();
    return { id: data.id, links: data.links };
  }

  async captureOrder(
    orderId: string,
  ): Promise<{ id: string; status: string; payer: Record<string, any> }> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      this.logger.error("PayPal captureOrder failed", err);
      throw new ServiceUnavailableException(
        "Failed to capture PayPal order",
      );
    }

    return res.json();
  }

  /**
   * Verify PayPal webhook signature via their verification endpoint.
   */
  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string,
  ): Promise<boolean> {
    if (!this.webhookId) {
      this.logger.warn("PAYPAL_WEBHOOK_ID is not configured");
      return false;
    }

    try {
      const token = await this.getAccessToken();

      const res = await fetch(
        `${this.baseUrl}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            auth_algo: headers["paypal-auth-algo"] ?? "",
            cert_url: headers["paypal-cert-url"] ?? "",
            transmission_id: headers["paypal-transmission-id"] ?? "",
            transmission_sig: headers["paypal-transmission-sig"] ?? "",
            transmission_time: headers["paypal-transmission-time"] ?? "",
            webhook_id: this.webhookId,
            webhook_event: JSON.parse(body),
          }),
        },
      );

      if (!res.ok) {
        this.logger.error("PayPal webhook verification request failed");
        return false;
      }

      const data = await res.json();
      return data.verification_status === "SUCCESS";
    } catch (err) {
      this.logger.error("PayPal webhook verification error", err);
      return false;
    }
  }
}
