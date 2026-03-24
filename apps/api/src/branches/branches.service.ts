import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BranchType, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({
        data: {
          tenantId,
          name: dto.name,
          code: dto.code,
          type: (dto.type as BranchType) ?? BranchType.WAREHOUSE,
          address: dto.address as Prisma.InputJsonValue,
          coordinates: dto.coordinates as Prisma.InputJsonValue | undefined,
          phone: dto.phone,
          email: dto.email,
          hours: dto.hours as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ConflictException(
          "Branch code already exists for this tenant",
        );
      }
      throw e;
    }
  }

  async list(tenantId: string, page = 1, limit = 20, type?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.BranchWhereInput = {
      tenantId,
      isActive: true,
      ...(type ? { type: type as BranchType } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
    });
    if (!branch) throw new NotFoundException("Branch not found");
    return branch;
  }

  async update(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOne(tenantId, id);

    const { type: rawType, address, coordinates, hours, ...rest } = dto;
    const data: Prisma.BranchUpdateInput = {
      ...rest,
      ...(rawType ? { type: rawType as BranchType } : {}),
      ...(dto.address
        ? { address: dto.address as Prisma.InputJsonValue }
        : {}),
      ...(dto.coordinates !== undefined
        ? { coordinates: dto.coordinates as Prisma.InputJsonValue }
        : {}),
      ...(dto.hours !== undefined
        ? { hours: dto.hours as Prisma.InputJsonValue }
        : {}),
    };

    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  async softDelete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async listPublic(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: "asc" },
    });
  }
}
