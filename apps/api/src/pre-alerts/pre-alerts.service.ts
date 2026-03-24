import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PreAlertStatus, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreatePreAlertDto } from "./dto/create-pre-alert.dto";
import { UpdatePreAlertDto } from "./dto/update-pre-alert.dto";

@Injectable()
export class PreAlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, customerId: string, dto: CreatePreAlertDto) {
    try {
      return await this.prisma.preAlert.create({
        data: {
          tenantId,
          customerId,
          trackingNumber: dto.trackingNumber,
          carrier: dto.carrier,
          store: dto.store,
          description: dto.description,
          estimatedValue: dto.estimatedValue,
          currency: dto.currency ?? "USD",
          category: dto.category,
          invoiceUrl: dto.invoiceUrl,
          status: PreAlertStatus.PENDING,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException(
          "A pre-alert with this tracking number already exists for this tenant",
        );
      }
      throw e;
    }
  }

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: { status?: string; customerId?: string },
  ) {
    const where: Prisma.PreAlertWhereInput = { tenantId };

    if (filters?.status) {
      where.status = filters.status as PreAlertStatus;
    }
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.preAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.preAlert.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const preAlert = await this.prisma.preAlert.findFirst({
      where: { id, tenantId },
    });
    if (!preAlert) {
      throw new NotFoundException("Pre-alert not found");
    }
    return preAlert;
  }

  async update(tenantId: string, id: string, dto: UpdatePreAlertDto) {
    const preAlert = await this.findOne(tenantId, id);

    if (preAlert.status !== PreAlertStatus.PENDING) {
      throw new ForbiddenException(
        "Only pre-alerts with PENDING status can be updated",
      );
    }

    return this.prisma.preAlert.update({
      where: { id },
      data: {
        trackingNumber: dto.trackingNumber,
        carrier: dto.carrier,
        store: dto.store,
        description: dto.description,
        estimatedValue: dto.estimatedValue,
        currency: dto.currency,
        category: dto.category,
        invoiceUrl: dto.invoiceUrl,
      },
    });
  }

  async cancel(tenantId: string, id: string) {
    const preAlert = await this.findOne(tenantId, id);

    if (preAlert.status !== PreAlertStatus.PENDING) {
      throw new ForbiddenException(
        "Only pre-alerts with PENDING status can be cancelled",
      );
    }

    return this.prisma.preAlert.update({
      where: { id },
      data: { status: PreAlertStatus.CANCELLED },
    });
  }

  async linkToShipment(tenantId: string, id: string, shipmentId: string) {
    const preAlert = await this.findOne(tenantId, id);

    if (preAlert.status !== PreAlertStatus.PENDING) {
      throw new ForbiddenException(
        "Only pre-alerts with PENDING status can be linked to a shipment",
      );
    }

    return this.prisma.preAlert.update({
      where: { id },
      data: {
        shipmentId,
        status: PreAlertStatus.RECEIVED,
        processedAt: new Date(),
      },
    });
  }

  async listUnmatched(tenantId: string, page = 1, limit = 20) {
    const where: Prisma.PreAlertWhereInput = {
      tenantId,
      status: PreAlertStatus.PENDING,
      shipmentId: null,
    };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.preAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.preAlert.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByCustomer(
    tenantId: string,
    customerId: string,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.PreAlertWhereInput = { tenantId, customerId };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.preAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.preAlert.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async autoLink(
    tenantId: string,
    trackingNumber: string,
    shipmentId: string,
  ) {
    const preAlert = await this.prisma.preAlert.findFirst({
      where: {
        tenantId,
        trackingNumber,
        status: PreAlertStatus.PENDING,
      },
    });

    if (!preAlert) {
      return null;
    }

    return this.prisma.preAlert.update({
      where: { id: preAlert.id },
      data: {
        shipmentId,
        status: PreAlertStatus.RECEIVED,
        processedAt: new Date(),
      },
    });
  }
}
