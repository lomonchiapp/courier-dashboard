import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventSource, Prisma, TrackingEventType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateDeliveryOrderDto } from "./dto/create-delivery-order.dto";
import { AssignDriverDto } from "./dto/assign-driver.dto";
import { CompleteDeliveryDto } from "./dto/complete-delivery.dto";
import { FailDeliveryDto } from "./dto/fail-delivery.dto";

@Injectable()
export class DeliveryOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateDeliveryOrderDto) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: dto.shipmentId, tenantId },
    });
    if (!shipment) {
      throw new NotFoundException("Shipment not found");
    }

    const customerId = dto.customerId ?? shipment.customerId ?? undefined;

    // Generate sequential number DO-XXXXX
    const count = await this.prisma.deliveryOrder.count({ where: { tenantId } });
    const number = `DO-${String(count + 1).padStart(5, "0")}`;

    return this.prisma.deliveryOrder.create({
      data: {
        tenantId,
        shipmentId: dto.shipmentId,
        customerId,
        number,
        deliveryType: dto.deliveryType,
        deliveryAddress: dto.deliveryAddress as Prisma.InputJsonValue | undefined,
        deliveryCoords: dto.deliveryCoords as unknown as Prisma.InputJsonValue | undefined,
        pickupBranchId: dto.pickupBranchId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        notes: dto.notes,
        status: "PENDING",
      },
    });
  }

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      customerId?: string;
      driverName?: string;
      deliveryType?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const where: Prisma.DeliveryOrderWhereInput = { tenantId };

    if (filters?.status) {
      where.status = filters.status as any;
    }
    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }
    if (filters?.driverName) {
      where.driverName = { contains: filters.driverName, mode: "insensitive" };
    }
    if (filters?.deliveryType) {
      where.deliveryType = filters.deliveryType as any;
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
      this.prisma.deliveryOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const order = await this.prisma.deliveryOrder.findFirst({
      where: { id, tenantId },
    });
    if (!order) {
      throw new NotFoundException("Delivery order not found");
    }
    return order;
  }

  async assignDriver(tenantId: string, id: string, dto: AssignDriverDto) {
    const order = await this.findOne(tenantId, id);

    if (order.status !== "PENDING") {
      throw new BadRequestException(
        "Driver can only be assigned to orders with PENDING status",
      );
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        driverName: dto.driverName,
        driverPhone: dto.driverPhone,
        driverVehicle: dto.driverVehicle,
        status: "ASSIGNED",
      },
    });
  }

  async startDelivery(tenantId: string, id: string) {
    const order = await this.findOne(tenantId, id);

    if (order.status !== "ASSIGNED") {
      throw new BadRequestException(
        "Delivery can only be started from ASSIGNED status",
      );
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: "IN_TRANSIT",
        pickedUpAt: new Date(),
      },
    });
  }

  async completeDelivery(tenantId: string, id: string, dto: CompleteDeliveryDto) {
    const order = await this.findOne(tenantId, id);

    if (order.status !== "IN_TRANSIT") {
      throw new BadRequestException(
        "Delivery can only be completed from IN_TRANSIT status",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          signatureContact: dto.signatureContact,
          signatureIdType: dto.signatureIdType,
          signatureId: dto.signatureId,
          signatureUrl: dto.signatureUrl,
          photoUrl: dto.photoUrl,
          notes: dto.notes ?? order.notes,
        },
      });

      // Add DELIVERED tracking event to the shipment
      await tx.trackingEvent.create({
        data: {
          tenantId,
          shipmentId: order.shipmentId,
          occurredAt: new Date(),
          type: TrackingEventType.DELIVERED,
          source: EventSource.SYSTEM,
          payload: {
            deliveryOrderId: id,
            deliveryOrderNumber: order.number,
          },
        },
      });

      // Update shipment currentPhase to DELIVERED
      await tx.shipment.update({
        where: { id: order.shipmentId },
        data: { currentPhase: "DELIVERED" },
      });

      return updated;
    });
  }

  async failDelivery(tenantId: string, id: string, dto: FailDeliveryDto) {
    const order = await this.findOne(tenantId, id);

    if (order.status !== "IN_TRANSIT") {
      throw new BadRequestException(
        "Delivery can only be failed from IN_TRANSIT status",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status: "FAILED",
          failReason: dto.failReason,
          notes: dto.notes ?? order.notes,
        },
      });

      // Add EXCEPTION tracking event to the shipment
      await tx.trackingEvent.create({
        data: {
          tenantId,
          shipmentId: order.shipmentId,
          occurredAt: new Date(),
          type: TrackingEventType.EXCEPTION,
          source: EventSource.SYSTEM,
          payload: {
            deliveryOrderId: id,
            deliveryOrderNumber: order.number,
            failReason: dto.failReason,
          },
        },
      });

      return updated;
    });
  }

  async cancel(tenantId: string, id: string) {
    const order = await this.findOne(tenantId, id);

    if (order.status !== "PENDING" && order.status !== "ASSIGNED") {
      throw new BadRequestException(
        "Only orders with PENDING or ASSIGNED status can be cancelled",
      );
    }

    return this.prisma.deliveryOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  async listByCustomer(tenantId: string, customerId: string, page = 1, limit = 20) {
    const where: Prisma.DeliveryOrderWhereInput = { tenantId, customerId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
