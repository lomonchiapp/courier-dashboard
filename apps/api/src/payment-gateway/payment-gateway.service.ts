import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import {
  InvoiceStatus,
  PaymentGateway,
  PaymentIntentStatus,
  PaymentMethod,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { PaymentsService } from "@/invoices/payments.service";
import { StripeGateway } from "./gateways/stripe.gateway";
import { PayPalGateway } from "./gateways/paypal.gateway";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
    private readonly stripe: StripeGateway,
    private readonly paypal: PayPalGateway,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Create payment intent                                              */
  /* ------------------------------------------------------------------ */

  async createIntent(
    tenantId: string,
    customerId: string,
    dto: CreatePaymentIntentDto,
  ) {
    // Look up invoice to get amount
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId, customerId },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    if (
      invoice.status !== InvoiceStatus.ISSUED &&
      invoice.status !== InvoiceStatus.PARTIAL &&
      invoice.status !== InvoiceStatus.OVERDUE
    ) {
      throw new BadRequestException(
        `Invoice is not in a payable status (${invoice.status})`,
      );
    }

    const amount = Number(invoice.balance);
    if (amount <= 0) {
      throw new BadRequestException("Invoice has no outstanding balance");
    }

    const currency = dto.currency ?? invoice.currency ?? "USD";
    const metadata = {
      tenantId,
      customerId,
      invoiceId: dto.invoiceId,
    };

    let gatewayIntentId: string | null = null;
    let clientSecret: string | null = null;
    let approvalUrl: string | null = null;

    if (dto.gateway === "STRIPE") {
      const intent = await this.stripe.createIntent(amount, currency, metadata);
      gatewayIntentId = intent.id;
      clientSecret = intent.client_secret;
    } else {
      const order = await this.paypal.createOrder(amount, currency, {
        ...metadata,
        description: `Invoice ${invoice.number}`,
      });
      gatewayIntentId = order.id;
      const approveLink = order.links.find((l) => l.rel === "approve");
      approvalUrl = approveLink?.href ?? null;
    }

    const paymentIntent = await this.prisma.paymentIntent.create({
      data: {
        tenantId,
        customerId,
        invoiceId: dto.invoiceId,
        gateway: dto.gateway as PaymentGateway,
        gatewayIntentId,
        gatewayClientSecret: clientSecret,
        amount,
        currency,
        status: PaymentIntentStatus.CREATED,
        metadata: metadata as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      gateway: dto.gateway,
      ...(clientSecret ? { clientSecret } : {}),
      ...(approvalUrl ? { approvalUrl } : {}),
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Stripe webhook                                                     */
  /* ------------------------------------------------------------------ */

  async handleStripeWebhook(rawBody: Buffer | string, signature: string) {
    const valid = this.stripe.verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      throw new BadRequestException("Invalid Stripe webhook signature");
    }

    const event = JSON.parse(
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"),
    );

    const eventType: string = event.type;
    const intentData = event.data?.object;

    if (!intentData?.id) {
      this.logger.warn("Stripe webhook event missing intent id");
      return { received: true };
    }

    const paymentIntent = await this.prisma.paymentIntent.findFirst({
      where: { gatewayIntentId: intentData.id },
    });

    if (!paymentIntent) {
      this.logger.warn(
        `No PaymentIntent found for Stripe intent ${intentData.id}`,
      );
      return { received: true };
    }

    let newStatus: PaymentIntentStatus | null = null;

    switch (eventType) {
      case "payment_intent.succeeded":
        newStatus = PaymentIntentStatus.SUCCEEDED;
        break;
      case "payment_intent.payment_failed":
        newStatus = PaymentIntentStatus.FAILED;
        break;
      case "payment_intent.canceled":
        newStatus = PaymentIntentStatus.CANCELLED;
        break;
      case "payment_intent.processing":
        newStatus = PaymentIntentStatus.PROCESSING;
        break;
      case "payment_intent.requires_action":
        newStatus = PaymentIntentStatus.REQUIRES_ACTION;
        break;
      default:
        this.logger.log(`Unhandled Stripe event type: ${eventType}`);
        return { received: true };
    }

    const updateData: Prisma.PaymentIntentUpdateInput = { status: newStatus };

    if (newStatus === PaymentIntentStatus.FAILED) {
      updateData.errorMessage =
        intentData.last_payment_error?.message ?? "Payment failed";
    }

    // On success, create a payment record
    if (newStatus === PaymentIntentStatus.SUCCEEDED && !paymentIntent.paymentId) {
      try {
        const payment = await this.payments.record(paymentIntent.tenantId, {
          method: PaymentMethod.STRIPE,
          amount: Number(paymentIntent.amount),
          currency: paymentIntent.currency,
          reference: `stripe:${intentData.id}`,
          customerId: paymentIntent.customerId,
          allocations: [
            {
              invoiceId: paymentIntent.invoiceId!,
              amount: Number(paymentIntent.amount),
            },
          ],
        });
        updateData.paymentId = payment.id;
      } catch (err) {
        this.logger.error("Failed to record payment from Stripe webhook", err);
      }
    }

    await this.prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: updateData,
    });

    return { received: true };
  }

  /* ------------------------------------------------------------------ */
  /*  PayPal webhook                                                     */
  /* ------------------------------------------------------------------ */

  async handlePaypalWebhook(
    headers: Record<string, string>,
    body: string,
  ) {
    const valid = await this.paypal.verifyWebhookSignature(headers, body);
    if (!valid) {
      throw new BadRequestException("Invalid PayPal webhook signature");
    }

    const event = JSON.parse(body);
    const eventType: string = event.event_type;
    const resource = event.resource;

    if (!resource?.id) {
      this.logger.warn("PayPal webhook event missing resource id");
      return { received: true };
    }

    // For CHECKOUT.ORDER.APPROVED, look up by order id and capture
    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const paymentIntent = await this.prisma.paymentIntent.findFirst({
        where: { gatewayIntentId: resource.id },
      });

      if (!paymentIntent) {
        this.logger.warn(
          `No PaymentIntent found for PayPal order ${resource.id}`,
        );
        return { received: true };
      }

      // Capture the order
      try {
        const capture = await this.paypal.captureOrder(resource.id);

        if (capture.status === "COMPLETED" && !paymentIntent.paymentId) {
          const payment = await this.payments.record(paymentIntent.tenantId, {
            method: PaymentMethod.PAYPAL,
            amount: Number(paymentIntent.amount),
            currency: paymentIntent.currency,
            reference: `paypal:${resource.id}`,
            customerId: paymentIntent.customerId,
            allocations: [
              {
                invoiceId: paymentIntent.invoiceId!,
                amount: Number(paymentIntent.amount),
              },
            ],
          });

          await this.prisma.paymentIntent.update({
            where: { id: paymentIntent.id },
            data: {
              status: PaymentIntentStatus.SUCCEEDED,
              paymentId: payment.id,
            },
          });
        }
      } catch (err) {
        this.logger.error("Failed to capture PayPal order", err);
        await this.prisma.paymentIntent.update({
          where: { id: paymentIntent.id },
          data: {
            status: PaymentIntentStatus.FAILED,
            errorMessage: "Capture failed",
          },
        });
      }

      return { received: true };
    }

    // Handle PAYMENT.CAPTURE.DENIED
    if (eventType === "PAYMENT.CAPTURE.DENIED") {
      const customId = resource.custom_id;
      if (customId) {
        await this.prisma.paymentIntent.updateMany({
          where: { id: customId },
          data: {
            status: PaymentIntentStatus.FAILED,
            errorMessage: "Payment capture denied",
          },
        });
      }
    }

    return { received: true };
  }

  /* ------------------------------------------------------------------ */
  /*  List / Detail / Cancel                                             */
  /* ------------------------------------------------------------------ */

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      customerId?: string;
      gateway?: string;
      status?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentIntentWhereInput = {
      tenantId,
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.gateway
        ? { gateway: filters.gateway as PaymentGateway }
        : {}),
      ...(filters?.status
        ? { status: filters.status as PaymentIntentStatus }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.paymentIntent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.paymentIntent.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { id, tenantId },
    });
    if (!intent) throw new NotFoundException("Payment intent not found");
    return intent;
  }

  async cancel(tenantId: string, id: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { id, tenantId },
    });
    if (!intent) throw new NotFoundException("Payment intent not found");

    if (
      intent.status === PaymentIntentStatus.SUCCEEDED ||
      intent.status === PaymentIntentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel a payment intent with status ${intent.status}`,
      );
    }

    // Cancel on the gateway side
    if (intent.gateway === PaymentGateway.STRIPE && intent.gatewayIntentId) {
      try {
        await this.stripe.cancelIntent(intent.gatewayIntentId);
      } catch (err) {
        this.logger.error("Failed to cancel Stripe intent", err);
      }
    }

    return this.prisma.paymentIntent.update({
      where: { id },
      data: { status: PaymentIntentStatus.CANCELLED },
    });
  }
}
