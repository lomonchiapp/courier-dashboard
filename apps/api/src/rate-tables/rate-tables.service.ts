import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateRateTableDto } from "./dto/create-rate-table.dto";
import { UpdateRateTableDto } from "./dto/update-rate-table.dto";
import { CreateRateTierDto } from "./dto/create-rate-tier.dto";
import { UpdateRateTierDto } from "./dto/update-rate-tier.dto";

@Injectable()
export class RateTablesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Rate Tables ──

  async create(tenantId: string, dto: CreateRateTableDto) {
    return this.prisma.rateTable.create({
      data: {
        tenantId,
        name: dto.name,
        originZone: dto.originZone,
        destZone: dto.destZone,
        isDefault: dto.isDefault ?? false,
      },
      include: { tiers: true },
    });
  }

  async list(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Prisma.RateTableWhereInput = { tenantId };

    const [items, total] = await Promise.all([
      this.prisma.rateTable.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { tiers: true } } },
      }),
      this.prisma.rateTable.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const table = await this.prisma.rateTable.findFirst({
      where: { id, tenantId },
      include: { tiers: { orderBy: { minWeight: "asc" } } },
    });
    if (!table) throw new NotFoundException("Rate table not found");
    return table;
  }

  async update(tenantId: string, id: string, dto: UpdateRateTableDto) {
    await this.findOne(tenantId, id);
    return this.prisma.rateTable.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.originZone !== undefined
          ? { originZone: dto.originZone }
          : {}),
        ...(dto.destZone !== undefined ? { destZone: dto.destZone } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
      },
      include: { tiers: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.rateTable.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Rate Tiers ──

  async addTier(tenantId: string, tableId: string, dto: CreateRateTierDto) {
    await this.findOne(tenantId, tableId);
    return this.prisma.rateTier.create({
      data: {
        rateTableId: tableId,
        minWeight: dto.minWeight,
        maxWeight: dto.maxWeight,
        pricePerLb: dto.pricePerLb,
        flatFee: dto.flatFee ?? 0,
        currency: dto.currency ?? "USD",
      },
    });
  }

  async updateTier(
    tenantId: string,
    tableId: string,
    tierId: string,
    dto: UpdateRateTierDto,
  ) {
    await this.findOne(tenantId, tableId);

    const tier = await this.prisma.rateTier.findFirst({
      where: { id: tierId, rateTableId: tableId },
    });
    if (!tier) throw new NotFoundException("Rate tier not found");

    return this.prisma.rateTier.update({
      where: { id: tierId },
      data: {
        ...(dto.minWeight !== undefined ? { minWeight: dto.minWeight } : {}),
        ...(dto.maxWeight !== undefined ? { maxWeight: dto.maxWeight } : {}),
        ...(dto.pricePerLb !== undefined
          ? { pricePerLb: dto.pricePerLb }
          : {}),
        ...(dto.flatFee !== undefined ? { flatFee: dto.flatFee } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
      },
    });
  }

  async removeTier(tenantId: string, tableId: string, tierId: string) {
    await this.findOne(tenantId, tableId);

    const tier = await this.prisma.rateTier.findFirst({
      where: { id: tierId, rateTableId: tableId },
    });
    if (!tier) throw new NotFoundException("Rate tier not found");

    await this.prisma.rateTier.delete({ where: { id: tierId } });
    return { deleted: true };
  }
}
