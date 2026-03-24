import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ReceptionStatus } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateReceptionDto } from "./dto/create-reception.dto";
import { UpdateReceptionDto } from "./dto/update-reception.dto";
import { AddChargeDto } from "./dto/add-charge.dto";

interface Charge {
  description: string;
  amount: number;
  currency: string;
}

const STATUS_TRANSITIONS: Record<ReceptionStatus, ReceptionStatus[]> = {
  PENDING: [ReceptionStatus.MEASURED, ReceptionStatus.CHARGED],
  MEASURED: [ReceptionStatus.CHARGED],
  CHARGED: [ReceptionStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [ReceptionStatus.DELIVERED],
  DELIVERED: [],
};

@Injectable()
export class ReceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateVolumetricWeight(
    lengthCm?: number,
    widthCm?: number,
    heightCm?: number,
  ): number | null {
    if (
      lengthCm != null &&
      widthCm != null &&
      heightCm != null &&
      lengthCm > 0 &&
      widthCm > 0 &&
      heightCm > 0
    ) {
      const volKg = (lengthCm * widthCm * heightCm) / 5000;
      const volLbs = volKg / 0.4536;
      return Math.round(volLbs * 100) / 100;
    }
    return null;
  }

  async create(tenantId: string, dto: CreateReceptionDto) {
    let customerId = dto.customerId;

    if (!customerId) {
      const shipment = await this.prisma.shipment.findFirst({
        where: { id: dto.shipmentId, tenantId },
        select: { customerId: true },
      });
      if (shipment?.customerId) {
        customerId = shipment.customerId;
      }
    }

    const volumetricWeight = this.calculateVolumetricWeight(
      dto.lengthCm,
      dto.widthCm,
      dto.heightCm,
    );

    return this.prisma.reception.create({
      data: {
        tenantId,
        shipmentId: dto.shipmentId,
        branchId: dto.branchId,
        customerId: customerId ?? null,
        weightLbs: dto.weightLbs,
        lengthCm: dto.lengthCm,
        widthCm: dto.widthCm,
        heightCm: dto.heightCm,
        volumetricWeight,
        photos: (dto.photos ?? []) as Prisma.InputJsonValue,
        notes: dto.notes,
      },
    });
  }

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters?: {
      branchId?: string;
      status?: string;
      customerId?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ReceptionWhereInput = {
      tenantId,
      ...(filters?.branchId ? { branchId: filters.branchId } : {}),
      ...(filters?.status
        ? { status: filters.status as ReceptionStatus }
        : {}),
      ...(filters?.customerId ? { customerId: filters.customerId } : {}),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            receivedAt: {
              ...(filters.dateFrom
                ? { gte: new Date(filters.dateFrom) }
                : {}),
              ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.reception.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
        include: { shipment: { select: { trackingNumber: true } } },
      }),
      this.prisma.reception.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const reception = await this.prisma.reception.findFirst({
      where: { id, tenantId },
      include: {
        shipment: { select: { trackingNumber: true, reference: true } },
        branch: { select: { name: true, code: true } },
      },
    });
    if (!reception) throw new NotFoundException("Reception not found");
    return reception;
  }

  async update(tenantId: string, id: string, dto: UpdateReceptionDto) {
    await this.findOne(tenantId, id);

    const existing = await this.prisma.reception.findFirst({
      where: { id, tenantId },
    });

    const lengthCm = dto.lengthCm ?? (existing?.lengthCm ? Number(existing.lengthCm) : undefined);
    const widthCm = dto.widthCm ?? (existing?.widthCm ? Number(existing.widthCm) : undefined);
    const heightCm = dto.heightCm ?? (existing?.heightCm ? Number(existing.heightCm) : undefined);

    const volumetricWeight = this.calculateVolumetricWeight(
      lengthCm,
      widthCm,
      heightCm,
    );

    const data: Prisma.ReceptionUpdateInput = {};

    if (dto.shipmentId !== undefined) data.shipment = { connect: { id: dto.shipmentId } };
    if (dto.branchId !== undefined) data.branch = { connect: { id: dto.branchId } };
    if (dto.customerId !== undefined) data.customerId = dto.customerId;
    if (dto.weightLbs !== undefined) data.weightLbs = dto.weightLbs;
    if (dto.lengthCm !== undefined) data.lengthCm = dto.lengthCm;
    if (dto.widthCm !== undefined) data.widthCm = dto.widthCm;
    if (dto.heightCm !== undefined) data.heightCm = dto.heightCm;
    if (dto.photos !== undefined) data.photos = dto.photos as Prisma.InputJsonValue;
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (volumetricWeight !== null) {
      data.volumetricWeight = volumetricWeight;
    }

    return this.prisma.reception.update({
      where: { id },
      data,
    });
  }

  async addCharge(tenantId: string, id: string, dto: AddChargeDto) {
    const reception = await this.findOne(tenantId, id);

    const charges = (reception.charges as unknown as Charge[]) ?? [];
    const newCharge: Charge = {
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency ?? "USD",
    };
    charges.push(newCharge);

    const totalCharge = charges.reduce((sum, c) => sum + c.amount, 0);

    return this.prisma.reception.update({
      where: { id },
      data: {
        charges: charges as unknown as Prisma.InputJsonValue,
        totalCharge,
      },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const reception = await this.findOne(tenantId, id);
    const currentStatus = reception.status as ReceptionStatus;
    const targetStatus = status as ReceptionStatus;

    if (!Object.values(ReceptionStatus).includes(targetStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const allowed = STATUS_TRANSITIONS[currentStatus];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${targetStatus}. Allowed: ${allowed.join(", ") || "none"}`,
      );
    }

    return this.prisma.reception.update({
      where: { id },
      data: { status: targetStatus },
    });
  }

  async listByCustomer(
    tenantId: string,
    customerId: string,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.ReceptionWhereInput = { tenantId, customerId };

    const [items, total] = await Promise.all([
      this.prisma.reception.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
        include: {
          shipment: { select: { trackingNumber: true } },
          branch: { select: { name: true } },
        },
      }),
      this.prisma.reception.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
