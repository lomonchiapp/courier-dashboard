import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EventSource, Prisma, TrackingEventType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { resolvePhaseAfterEvent } from "./tracking-state-machine";
import { AddEventDto } from "./dto/add-event.dto";
import { CreateShipmentDto } from "./dto/create-shipment.dto";

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateShipmentDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const shipment = await tx.shipment.create({
          data: {
            tenantId,
            trackingNumber: dto.trackingNumber,
            reference: dto.reference,
            metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
            currentPhase: "CREATED",
          },
        });

        await tx.trackingEvent.create({
          data: {
            tenantId,
            shipmentId: shipment.id,
            occurredAt: new Date(),
            type: TrackingEventType.CREATED,
            source: EventSource.SYSTEM,
            payload: {},
          },
        });

        return this.findOne(tenantId, shipment.id);
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Tracking number already exists for this tenant");
      }
      throw e;
    }
  }

  async list(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { events: true } } },
      }),
      this.prisma.shipment.count({ where: { tenantId } }),
    ]);

    return {
      data: items.map((s) => ({
        id: s.id,
        trackingNumber: s.trackingNumber,
        reference: s.reference,
        currentPhase: s.currentPhase,
        metadata: s.metadata,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        eventCount: s._count.events,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id, tenantId },
    });
    if (!shipment) throw new NotFoundException("Shipment not found");
    return shipment;
  }

  async findByTrackingNumber(tenantId: string, trackingNumber: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { tenantId, trackingNumber },
    });
    if (!shipment) throw new NotFoundException("Shipment not found");
    return shipment;
  }

  async listEvents(tenantId: string, shipmentId: string, page = 1, limit = 50) {
    await this.findOne(tenantId, shipmentId);
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.prisma.trackingEvent.findMany({
        where: { tenantId, shipmentId },
        orderBy: { occurredAt: "asc" },
        skip,
        take: limit,
      }),
      this.prisma.trackingEvent.count({ where: { tenantId, shipmentId } }),
    ]);

    return {
      data: events,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async addEvent(
    tenantId: string,
    shipmentId: string,
    dto: AddEventDto,
    idempotencyKey: string | undefined
  ) {
    const shipment = await this.findOne(tenantId, shipmentId);

    if (idempotencyKey) {
      const existing = await this.prisma.trackingEvent.findFirst({
        where: { shipmentId, idempotencyKey },
      });
      if (existing) {
        return { shipment: await this.findOne(tenantId, shipmentId), event: existing, idempotent: true };
      }
    }

    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    let nextPhase = shipment.currentPhase;
    if (dto.type !== TrackingEventType.NOTE) {
      const resolved = resolvePhaseAfterEvent(shipment.currentPhase, dto.type);
      if (resolved !== null) {
        nextPhase = resolved;
      }
    }

    try {
      const event = await this.prisma.$transaction(async (tx) => {
        const created = await tx.trackingEvent.create({
          data: {
            tenantId,
            shipmentId,
            occurredAt,
            type: dto.type,
            rawStatus: dto.rawStatus,
            location: dto.location as Prisma.InputJsonValue | undefined,
            source: dto.source,
            correlationId: dto.correlationId,
            payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
            idempotencyKey: idempotencyKey ?? null,
          },
        });

        if (nextPhase !== shipment.currentPhase) {
          await tx.shipment.update({
            where: { id: shipmentId },
            data: { currentPhase: nextPhase },
          });
        }

        return created;
      });

      const updated = await this.findOne(tenantId, shipmentId);
      return { shipment: updated, event, idempotent: false };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        idempotencyKey
      ) {
        const existing = await this.prisma.trackingEvent.findFirst({
          where: { shipmentId, idempotencyKey },
        });
        if (existing) {
          return {
            shipment: await this.findOne(tenantId, shipmentId),
            event: existing,
            idempotent: true,
          };
        }
      }
      throw e;
    }
  }
}
