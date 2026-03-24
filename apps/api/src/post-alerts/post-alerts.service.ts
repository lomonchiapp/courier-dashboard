import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreatePostAlertDto } from "./dto/create-post-alert.dto";
import { UpdatePostAlertDto } from "./dto/update-post-alert.dto";

@Injectable()
export class PostAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreatePostAlertDto) {
    // Auto-populate customerId from shipment if not explicitly provided
    let customerId: string | null = null;
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: dto.shipmentId, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }
    if (shipment.customerId) {
      customerId = shipment.customerId;
    }

    return this.prisma.postAlert.create({
      data: {
        tenantId,
        shipmentId: dto.shipmentId,
        customerId,
        trackingNumber: dto.trackingNumber,
        recipientName: dto.recipientName,
        senderName: dto.senderName,
        carrier: dto.carrier,
        fob: dto.fob != null ? new Prisma.Decimal(dto.fob) : undefined,
        currency: dto.currency ?? "USD",
        invoiceUrl: dto.invoiceUrl,
        content: dto.content,
      },
    });
  }

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      customerId?: string;
      shipmentId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: Prisma.PostAlertWhereInput = { tenantId };

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters?.shipmentId) {
      where.shipmentId = filters.shipmentId;
    }
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.postAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.postAlert.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const postAlert = await this.prisma.postAlert.findFirst({
      where: { id, tenantId },
    });
    if (!postAlert) {
      throw new NotFoundException("Post-alert not found");
    }
    return postAlert;
  }

  async update(tenantId: string, id: string, dto: UpdatePostAlertDto) {
    await this.findOne(tenantId, id);

    return this.prisma.postAlert.update({
      where: { id },
      data: {
        ...(dto.trackingNumber !== undefined && { trackingNumber: dto.trackingNumber }),
        ...(dto.recipientName !== undefined && { recipientName: dto.recipientName }),
        ...(dto.senderName !== undefined && { senderName: dto.senderName }),
        ...(dto.carrier !== undefined && { carrier: dto.carrier }),
        ...(dto.fob !== undefined && { fob: new Prisma.Decimal(dto.fob) }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.invoiceUrl !== undefined && { invoiceUrl: dto.invoiceUrl }),
        ...(dto.content !== undefined && { content: dto.content }),
      },
    });
  }
}
