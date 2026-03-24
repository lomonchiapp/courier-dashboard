import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DgaLabelStatus, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateDgaLabelDto } from "./dto/create-dga-label.dto";
import { UpdateDgaLabelDto } from "./dto/update-dga-label.dto";

@Injectable()
export class DgaService {
  constructor(private readonly prisma: PrismaService) {}

  /* ─── Create ─────────────────────────────────────────────── */

  async create(tenantId: string, dto: CreateDgaLabelDto) {
    // Auto-populate customerId from shipment if available
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: dto.shipmentId, tenantId },
      select: { customerId: true },
    });
    if (!shipment) throw new NotFoundException("Shipment not found");

    const taxExempt = dto.fobValue < 200;
    const itbisAmount = taxExempt ? 0 : dto.fobValue * 0.18;
    const customsDuty = 0; // Simplified — can be enhanced with HS code lookup
    const totalTaxes = itbisAmount + customsDuty;

    return this.prisma.dgaLabel.create({
      data: {
        tenantId,
        shipmentId: dto.shipmentId,
        containerId: dto.containerId ?? null,
        customerId: shipment.customerId ?? null,
        consigneeName: dto.consigneeName,
        consigneeCedula: dto.consigneeCedula,
        consigneeRnc: dto.consigneeRnc,
        consigneeAddress: dto.consigneeAddress,
        consigneePhone: dto.consigneePhone,
        trackingNumber: dto.trackingNumber,
        description: dto.description,
        hsCode: dto.hsCode,
        category: dto.category,
        pieces: dto.pieces ?? 1,
        weightLbs: dto.weightLbs,
        fobValue: dto.fobValue,
        currency: dto.currency ?? "USD",
        originCountry: dto.originCountry,
        regimeType: dto.regimeType,
        taxExempt,
        itbisAmount,
        customsDuty,
        totalTaxes,
        generatedAt: new Date(),
      },
    });
  }

  /* ─── List ───────────────────────────────────────────────── */

  async list(
    tenantId: string,
    page = 1,
    limit = 20,
    filters: {
      status?: DgaLabelStatus;
      containerId?: string;
      shipmentId?: string;
    } = {},
  ) {
    const where: Prisma.DgaLabelWhereInput = {
      tenantId,
      ...(filters.status && { status: filters.status }),
      ...(filters.containerId && { containerId: filters.containerId }),
      ...(filters.shipmentId && { shipmentId: filters.shipmentId }),
    };

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.dgaLabel.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.dgaLabel.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /* ─── Find One ───────────────────────────────────────────── */

  async findOne(tenantId: string, id: string) {
    const label = await this.prisma.dgaLabel.findFirst({
      where: { id, tenantId },
      include: {
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            reference: true,
            currentPhase: true,
          },
        },
        container: {
          select: { id: true, number: true, status: true },
        },
      },
    });
    if (!label) throw new NotFoundException("DGA label not found");
    return label;
  }

  /* ─── Update ─────────────────────────────────────────────── */

  async update(tenantId: string, id: string, dto: UpdateDgaLabelDto) {
    await this.findOne(tenantId, id);

    // Build update payload using unchecked input (supports raw FK fields)
    const data: Prisma.DgaLabelUncheckedUpdateInput = {};

    if (dto.shipmentId !== undefined) data.shipmentId = dto.shipmentId;
    if (dto.containerId !== undefined) data.containerId = dto.containerId;
    if (dto.consigneeName !== undefined) data.consigneeName = dto.consigneeName;
    if (dto.consigneeCedula !== undefined) data.consigneeCedula = dto.consigneeCedula;
    if (dto.consigneeRnc !== undefined) data.consigneeRnc = dto.consigneeRnc;
    if (dto.consigneeAddress !== undefined) data.consigneeAddress = dto.consigneeAddress;
    if (dto.consigneePhone !== undefined) data.consigneePhone = dto.consigneePhone;
    if (dto.trackingNumber !== undefined) data.trackingNumber = dto.trackingNumber;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.hsCode !== undefined) data.hsCode = dto.hsCode;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.pieces !== undefined) data.pieces = dto.pieces;
    if (dto.weightLbs !== undefined) data.weightLbs = dto.weightLbs;
    if (dto.fobValue !== undefined) data.fobValue = dto.fobValue;
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.originCountry !== undefined) data.originCountry = dto.originCountry;
    if (dto.regimeType !== undefined) data.regimeType = dto.regimeType;
    if (dto.dgaBarcode !== undefined) data.dgaBarcode = dto.dgaBarcode;
    if (dto.dgaManifestNumber !== undefined) data.dgaManifestNumber = dto.dgaManifestNumber;
    if (dto.status !== undefined) data.status = dto.status;

    // Recalculate taxes if fobValue changed
    if (dto.fobValue !== undefined) {
      const taxExempt = dto.fobValue < 200;
      const itbisAmount = taxExempt ? 0 : dto.fobValue * 0.18;
      data.taxExempt = taxExempt;
      data.itbisAmount = itbisAmount;
      data.customsDuty = 0;
      data.totalTaxes = itbisAmount;
    }

    // Set clearedAt when status transitions to CLEARED
    if (dto.status === DgaLabelStatus.CLEARED) {
      data.clearedAt = new Date();
    }

    return this.prisma.dgaLabel.update({ where: { id }, data });
  }

  /* ─── Generate for Container ─────────────────────────────── */

  async generateForContainer(tenantId: string, containerId: string) {
    // Get container with items + shipment/customer data
    const container = await this.prisma.container.findFirst({
      where: { id: containerId, tenantId },
      include: {
        items: {
          include: {
            shipment: {
              include: {
                customer: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    idType: true,
                    idNumber: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!container) throw new NotFoundException("Container not found");

    // Find shipments that already have a DGA label in this container
    const existingLabels = await this.prisma.dgaLabel.findMany({
      where: { tenantId, containerId },
      select: { shipmentId: true },
    });
    const existingShipmentIds = new Set(existingLabels.map((l) => l.shipmentId));

    // Filter items that don't have labels yet
    const itemsToGenerate = container.items.filter(
      (item) => !existingShipmentIds.has(item.shipmentId),
    );

    if (itemsToGenerate.length === 0) {
      return { generated: 0, labels: [] };
    }

    const now = new Date();
    const labels = await this.prisma.$transaction(
      itemsToGenerate.map((item) => {
        const customer = item.shipment.customer;
        const consigneeName = customer
          ? `${customer.firstName} ${customer.lastName}`
          : "N/A";

        const address =
          customer?.address && typeof customer.address === "object"
            ? Object.values(customer.address as Record<string, string>).join(", ")
            : undefined;

        // Determine cedula/RNC from customer idType
        let consigneeCedula: string | undefined;
        let consigneeRnc: string | undefined;
        if (customer?.idNumber) {
          if (customer.idType === "RNC") {
            consigneeRnc = customer.idNumber;
          } else {
            consigneeCedula = customer.idNumber;
          }
        }

        const weightLbs = item.weightLbs
          ? Number(item.weightLbs)
          : 1;
        const fobValue = 0; // Must be filled in manually or via pre-alert data
        const taxExempt = fobValue < 200;

        return this.prisma.dgaLabel.create({
          data: {
            tenantId,
            containerId,
            shipmentId: item.shipmentId,
            customerId: customer?.id ?? null,
            consigneeName,
            consigneeCedula: consigneeCedula ?? null,
            consigneeRnc: consigneeRnc ?? null,
            consigneeAddress: address ?? null,
            consigneePhone: customer?.phone ?? null,
            trackingNumber: item.shipment.trackingNumber,
            description: item.description ?? "Paquete",
            pieces: item.pieces,
            weightLbs,
            fobValue,
            currency: "USD",
            originCountry: container.origin ?? "US",
            taxExempt,
            itbisAmount: 0,
            customsDuty: 0,
            totalTaxes: 0,
            generatedAt: now,
          },
        });
      }),
    );

    return { generated: labels.length, labels };
  }

  /* ─── Bulk Update Status ─────────────────────────────────── */

  async bulkUpdateStatus(
    tenantId: string,
    ids: string[],
    status: DgaLabelStatus,
  ) {
    const extraData: Prisma.DgaLabelUpdateManyMutationInput = {};
    if (status === DgaLabelStatus.CLEARED) {
      extraData.clearedAt = new Date();
    }

    const result = await this.prisma.dgaLabel.updateMany({
      where: { id: { in: ids }, tenantId },
      data: { status, ...extraData },
    });

    return { updated: result.count };
  }

  /* ─── Stats ──────────────────────────────────────────────── */

  async getStats(tenantId: string, containerId?: string) {
    const where: Prisma.DgaLabelWhereInput = {
      tenantId,
      ...(containerId && { containerId }),
    };

    const [byStatus, totals] = await Promise.all([
      this.prisma.dgaLabel.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
      this.prisma.dgaLabel.aggregate({
        where,
        _sum: { fobValue: true, totalTaxes: true },
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus) {
      statusCounts[row.status] = row._count.id;
    }

    return {
      total: totals._count.id,
      byStatus: statusCounts,
      totalFobValue: totals._sum.fobValue
        ? Number(totals._sum.fobValue)
        : 0,
      totalTaxes: totals._sum.totalTaxes
        ? Number(totals._sum.totalTaxes)
        : 0,
    };
  }
}
