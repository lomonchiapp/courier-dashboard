import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventSource, Prisma, PreAlertStatus, TrackingEventType } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { PrismaService } from "@/prisma/prisma.service";
import { BulkCustomerItemDto } from "./dto/bulk-import-customers.dto";
import { BulkShipmentItemDto } from "./dto/bulk-import-shipments.dto";
import { BulkPreAlertItemDto } from "./dto/bulk-import-pre-alerts.dto";

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async importCustomers(
    tenantId: string,
    createdBy: string,
    items: BulkCustomerItemDto[],
  ) {
    const bulkImport = await this.prisma.bulkImport.create({
      data: {
        tenantId,
        type: "CUSTOMERS",
        status: "PROCESSING",
        totalRows: items.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        createdBy,
        startedAt: new Date(),
      },
    });

    const errors: { row: number; error: string }[] = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const tempPassword = crypto.randomBytes(16).toString("hex");
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        await this.prisma.$transaction(async (tx) => {
          const [result] = await tx.$queryRaw<{ casillero_prefix: string; casillero_counter: number }[]>`
            UPDATE tenants SET casillero_counter = casillero_counter + 1, updated_at = NOW()
            WHERE id = ${tenantId} RETURNING casillero_prefix, casillero_counter`;
          const casillero = `${result.casillero_prefix}-${String(result.casillero_counter).padStart(5, "0")}`;

          await tx.customer.create({
            data: {
              tenantId,
              casillero,
              email: item.email.toLowerCase().trim(),
              passwordHash,
              firstName: item.firstName,
              lastName: item.lastName,
              phone: item.phone,
              idType: item.idType as any,
              idNumber: item.idNumber,
            },
          });
        });

        succeeded++;
      } catch (err: any) {
        failed++;
        const message =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
            ? `Duplicate email: ${item.email}`
            : err.message ?? "Unknown error";
        errors.push({ row: i + 1, error: message });
        this.logger.warn(`Bulk customer import row ${i + 1} failed: ${message}`);
      }

      // Update progress
      await this.prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: {
          processed: i + 1,
          succeeded,
          failed,
          errors: errors as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // Mark as completed
    const finalStatus = failed === items.length ? "FAILED" : "COMPLETED";
    return this.prisma.bulkImport.update({
      where: { id: bulkImport.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
    });
  }

  async importShipments(
    tenantId: string,
    createdBy: string,
    items: BulkShipmentItemDto[],
  ) {
    const bulkImport = await this.prisma.bulkImport.create({
      data: {
        tenantId,
        type: "SHIPMENTS",
        status: "PROCESSING",
        totalRows: items.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        createdBy,
        startedAt: new Date(),
      },
    });

    const errors: { row: number; error: string }[] = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        await this.prisma.$transaction(async (tx) => {
          const shipment = await tx.shipment.create({
            data: {
              tenantId,
              trackingNumber: item.trackingNumber,
              reference: item.reference,
              customerId: item.customerId,
              metadata: (item.metadata ?? {}) as Prisma.InputJsonValue,
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
              payload: { bulkImportId: bulkImport.id },
            },
          });
        });

        succeeded++;
      } catch (err: any) {
        failed++;
        const message =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
            ? `Duplicate tracking number: ${item.trackingNumber}`
            : err.message ?? "Unknown error";
        errors.push({ row: i + 1, error: message });
        this.logger.warn(`Bulk shipment import row ${i + 1} failed: ${message}`);
      }

      await this.prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: {
          processed: i + 1,
          succeeded,
          failed,
          errors: errors as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const finalStatus = failed === items.length ? "FAILED" : "COMPLETED";
    return this.prisma.bulkImport.update({
      where: { id: bulkImport.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
    });
  }

  async importPreAlerts(
    tenantId: string,
    createdBy: string,
    items: BulkPreAlertItemDto[],
  ) {
    const bulkImport = await this.prisma.bulkImport.create({
      data: {
        tenantId,
        type: "PRE_ALERTS",
        status: "PROCESSING",
        totalRows: items.length,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [],
        createdBy,
        startedAt: new Date(),
      },
    });

    const errors: { row: number; error: string }[] = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        await this.prisma.preAlert.create({
          data: {
            tenantId,
            customerId: item.customerId,
            trackingNumber: item.trackingNumber,
            carrier: item.carrier,
            store: item.store,
            description: item.description,
            estimatedValue: item.estimatedValue,
            currency: item.currency ?? "USD",
            status: PreAlertStatus.PENDING,
          },
        });

        succeeded++;
      } catch (err: any) {
        failed++;
        const message =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
            ? `Duplicate tracking number: ${item.trackingNumber}`
            : err.message ?? "Unknown error";
        errors.push({ row: i + 1, error: message });
        this.logger.warn(`Bulk pre-alert import row ${i + 1} failed: ${message}`);
      }

      await this.prisma.bulkImport.update({
        where: { id: bulkImport.id },
        data: {
          processed: i + 1,
          succeeded,
          failed,
          errors: errors as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const finalStatus = failed === items.length ? "FAILED" : "COMPLETED";
    return this.prisma.bulkImport.update({
      where: { id: bulkImport.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
    });
  }

  async list(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.bulkImport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          tenantId: true,
          type: true,
          status: true,
          fileName: true,
          totalRows: true,
          processed: true,
          succeeded: true,
          failed: true,
          createdBy: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
      }),
      this.prisma.bulkImport.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string) {
    const bulkImport = await this.prisma.bulkImport.findFirst({
      where: { id, tenantId },
    });
    if (!bulkImport) {
      throw new NotFoundException("Bulk import not found");
    }
    return bulkImport;
  }
}
