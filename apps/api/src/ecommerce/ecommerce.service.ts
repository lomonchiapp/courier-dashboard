import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EcommercePlatform, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateConnectionDto } from "./dto/create-connection.dto";
import { UpdateConnectionDto } from "./dto/update-connection.dto";

@Injectable()
export class EcommerceService {
  private readonly logger = new Logger(EcommerceService.name);

  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /*  Connection CRUD                                                    */
  /* ------------------------------------------------------------------ */

  async createConnection(tenantId: string, dto: CreateConnectionDto) {
    try {
      return await this.prisma.ecommerceConnection.create({
        data: {
          tenantId,
          platform: dto.platform as EcommercePlatform,
          shopDomain: dto.shopDomain,
          webhookSecret: dto.webhookSecret,
          apiKey: dto.apiKey,
          isActive: true,
          metadata: {},
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException(
          "A connection for this platform and shop domain already exists",
        );
      }
      throw e;
    }
  }

  async listConnections(tenantId: string) {
    return this.prisma.ecommerceConnection.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateConnection(
    tenantId: string,
    id: string,
    dto: UpdateConnectionDto,
  ) {
    const connection = await this.prisma.ecommerceConnection.findFirst({
      where: { id, tenantId },
    });
    if (!connection) throw new NotFoundException("Connection not found");

    const data: Prisma.EcommerceConnectionUpdateInput = {};
    if (dto.shopDomain !== undefined) data.shopDomain = dto.shopDomain;
    if (dto.webhookSecret !== undefined) data.webhookSecret = dto.webhookSecret;
    if (dto.apiKey !== undefined) data.apiKey = dto.apiKey;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.ecommerceConnection.update({
      where: { id },
      data,
    });
  }

  async deleteConnection(tenantId: string, id: string) {
    const connection = await this.prisma.ecommerceConnection.findFirst({
      where: { id, tenantId },
    });
    if (!connection) throw new NotFoundException("Connection not found");

    await this.prisma.ecommerceConnection.delete({ where: { id } });
    return { deleted: true };
  }

  /* ------------------------------------------------------------------ */
  /*  Find connection (used by webhooks)                                 */
  /* ------------------------------------------------------------------ */

  async findConnection(id: string) {
    const connection = await this.prisma.ecommerceConnection.findUnique({
      where: { id },
    });
    if (!connection) throw new NotFoundException("Connection not found");
    return connection;
  }

  /* ------------------------------------------------------------------ */
  /*  Shopify order processing                                           */
  /* ------------------------------------------------------------------ */

  async processShopifyOrder(
    tenantId: string,
    connectionId: string,
    order: Record<string, any>,
  ) {
    const email =
      order.customer?.email ?? order.email ?? order.contact_email ?? null;
    const firstName = order.customer?.first_name ?? "Unknown";
    const lastName = order.customer?.last_name ?? "";
    const phone = order.customer?.phone ?? order.shipping_address?.phone ?? null;

    // Find or create customer
    const customer = await this.findOrCreateCustomer(
      tenantId,
      email,
      firstName,
      lastName,
      phone,
    );

    // Create shipment
    const trackingNumber =
      order.fulfillments?.[0]?.tracking_number ??
      order.name ??
      `SHOP-${order.id}`;

    const shipment = await this.prisma.shipment.create({
      data: {
        tenantId,
        trackingNumber,
        reference: `shopify:${order.id}`,
        currentPhase: "CREATED",
        metadata: {
          source: "shopify",
          connectionId,
          orderId: order.id,
          orderNumber: order.order_number ?? order.name,
          totalPrice: order.total_price,
          currency: order.currency,
          shippingAddress: order.shipping_address ?? null,
          lineItems: (order.line_items ?? []).map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Create pre-alert
    const preAlert = await this.prisma.preAlert.create({
      data: {
        tenantId,
        customerId: customer.id,
        trackingNumber,
        carrier: order.fulfillments?.[0]?.tracking_company ?? "Shopify",
        store: order.shipping_address?.company ?? "Shopify Store",
        description: (order.line_items ?? [])
          .map((item: any) => `${item.title} x${item.quantity}`)
          .join(", ")
          .slice(0, 500) || "Shopify order",
        estimatedValue: order.total_price
          ? parseFloat(order.total_price)
          : null,
        currency: order.currency ?? "USD",
        status: "PENDING",
      },
    });

    this.logger.log(
      `Processed Shopify order ${order.id} → shipment ${shipment.id}, preAlert ${preAlert.id}`,
    );

    return { shipment, preAlert, customer: { id: customer.id } };
  }

  /* ------------------------------------------------------------------ */
  /*  WooCommerce order processing                                       */
  /* ------------------------------------------------------------------ */

  async processWooCommerceOrder(
    tenantId: string,
    connectionId: string,
    order: Record<string, any>,
  ) {
    const billing = order.billing ?? {};
    const shipping = order.shipping ?? {};
    const email = billing.email ?? null;
    const firstName = billing.first_name ?? shipping.first_name ?? "Unknown";
    const lastName = billing.last_name ?? shipping.last_name ?? "";
    const phone = billing.phone ?? shipping.phone ?? null;

    // Find or create customer
    const customer = await this.findOrCreateCustomer(
      tenantId,
      email,
      firstName,
      lastName,
      phone,
    );

    // Create shipment
    const trackingNumber =
      order.meta_data?.find?.((m: any) => m.key === "_tracking_number")
        ?.value ?? `WOO-${order.id}`;

    const shipment = await this.prisma.shipment.create({
      data: {
        tenantId,
        trackingNumber,
        reference: `woocommerce:${order.id}`,
        currentPhase: "CREATED",
        metadata: {
          source: "woocommerce",
          connectionId,
          orderId: order.id,
          orderNumber: order.number,
          total: order.total,
          currency: order.currency,
          shippingAddress: shipping,
          lineItems: (order.line_items ?? []).map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // Create pre-alert
    const preAlert = await this.prisma.preAlert.create({
      data: {
        tenantId,
        customerId: customer.id,
        trackingNumber,
        carrier:
          order.shipping_lines?.[0]?.method_title ?? "WooCommerce",
        store: shipping.company ?? "WooCommerce Store",
        description: (order.line_items ?? [])
          .map((item: any) => `${item.name} x${item.quantity}`)
          .join(", ")
          .slice(0, 500) || "WooCommerce order",
        estimatedValue: order.total ? parseFloat(order.total) : null,
        currency: order.currency ?? "USD",
        status: "PENDING",
      },
    });

    this.logger.log(
      `Processed WooCommerce order ${order.id} → shipment ${shipment.id}, preAlert ${preAlert.id}`,
    );

    return { shipment, preAlert, customer: { id: customer.id } };
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  private async findOrCreateCustomer(
    tenantId: string,
    email: string | null,
    firstName: string,
    lastName: string,
    phone: string | null,
  ) {
    // Try to find by email first
    if (email) {
      const existing = await this.prisma.customer.findFirst({
        where: { tenantId, email: email.toLowerCase().trim() },
      });
      if (existing) return existing;
    }

    // Create new customer with a random password and auto-generated casillero
    const bcrypt = await import("bcryptjs");
    const crypto = await import("crypto");
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Generate casillero
    const count = await this.prisma.customer.count({ where: { tenantId } });
    const casillero = `C${String(count + 1).padStart(5, "0")}`;

    try {
      return await this.prisma.customer.create({
        data: {
          tenantId,
          email: email?.toLowerCase().trim() ?? `noemail-${crypto.randomUUID()}@placeholder.local`,
          passwordHash,
          firstName,
          lastName,
          phone,
          casillero,
        },
      });
    } catch (e) {
      // If duplicate email, just find the existing one
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        email
      ) {
        const existing = await this.prisma.customer.findFirst({
          where: { tenantId, email: email.toLowerCase().trim() },
        });
        if (existing) return existing;
      }
      throw e;
    }
  }
}
