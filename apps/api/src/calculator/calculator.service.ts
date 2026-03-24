import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { EstimateDto } from "./dto/estimate.dto";

@Injectable()
export class CalculatorService {
  constructor(private readonly prisma: PrismaService) {}

  async estimate(tenantId: string, dto: EstimateDto) {
    const actualWeight = dto.weightLbs;

    let volumetricWeight: number | null = null;
    if (
      dto.lengthCm != null &&
      dto.widthCm != null &&
      dto.heightCm != null &&
      dto.lengthCm > 0 &&
      dto.widthCm > 0 &&
      dto.heightCm > 0
    ) {
      const volKg = (dto.lengthCm * dto.widthCm * dto.heightCm) / 5000;
      volumetricWeight = Math.round((volKg / 0.4536) * 100) / 100;
    }

    const billableWeight =
      volumetricWeight != null
        ? Math.max(actualWeight, volumetricWeight)
        : actualWeight;

    // Find matching rate table by zones, falling back to default
    let rateTable = await this.prisma.rateTable.findFirst({
      where: {
        tenantId,
        isActive: true,
        ...(dto.originZone ? { originZone: dto.originZone } : {}),
        ...(dto.destZone ? { destZone: dto.destZone } : {}),
      },
      include: { tiers: true },
    });

    if (!rateTable) {
      rateTable = await this.prisma.rateTable.findFirst({
        where: { tenantId, isActive: true, isDefault: true },
        include: { tiers: true },
      });
    }

    if (!rateTable) {
      throw new NotFoundException(
        "No rate table found for the given tenant and zones",
      );
    }

    const tier = rateTable.tiers.find(
      (t) =>
        Number(t.minWeight) <= billableWeight &&
        billableWeight <= Number(t.maxWeight),
    );

    if (!tier) {
      throw new NotFoundException(
        `No rate tier found for weight ${billableWeight} lbs`,
      );
    }

    const pricePerLb = Number(tier.pricePerLb);
    const flatFee = Number(tier.flatFee);
    const total =
      Math.round((billableWeight * pricePerLb + flatFee) * 100) / 100;

    return {
      actualWeight,
      volumetricWeight,
      billableWeight,
      pricePerLb,
      flatFee,
      total,
      currency: tier.currency,
    };
  }
}
