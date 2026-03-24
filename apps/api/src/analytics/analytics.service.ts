import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ─── helpers ─── */

  private defaultDateRange(dateFrom?: string, dateTo?: string) {
    const to = dateTo ? new Date(dateTo) : new Date();
    const from = dateFrom
      ? new Date(dateFrom)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  private startOfDay(d: Date = new Date()): Date {
    const s = new Date(d);
    s.setHours(0, 0, 0, 0);
    return s;
  }

  private endOfDay(d: Date = new Date()): Date {
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    return e;
  }

  /* ─── a) Overview ─── */

  async getOverview(tenantId: string, dateFrom?: string, dateTo?: string) {
    const { from, to } = this.defaultDateRange(dateFrom, dateTo);
    const todayStart = this.startOfDay();
    const todayEnd = this.endOfDay();

    const [
      shipmentTotal,
      shipmentsByPhase,
      shipmentsCreatedToday,
      shipmentsDeliveredToday,
      customerTotal,
      customerActive,
      customerNew,
      invoiceAgg,
      paymentAgg,
      outstandingAgg,
      overdueCount,
      receptionsToday,
      receptionsPendingPickup,
      preAlertsPending,
      preAlertsUnmatched,
      containersOpen,
      containersInTransit,
      containersInCustoms,
      doPendingToday,
      doInTransit,
      doDeliveredToday,
      doFailedToday,
    ] = await Promise.all([
      // Shipments
      this.prisma.shipment.count({ where: { tenantId } }),

      this.prisma.shipment.groupBy({
        by: ["currentPhase"],
        where: { tenantId },
        _count: true,
      }),

      this.prisma.shipment.count({
        where: { tenantId, createdAt: { gte: todayStart, lte: todayEnd } },
      }),

      this.prisma.shipment.count({
        where: {
          tenantId,
          currentPhase: "DELIVERED",
          updatedAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      // Customers
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.customer.count({ where: { tenantId, isActive: true } }),
      this.prisma.customer.count({
        where: { tenantId, createdAt: { gte: from, lte: to } },
      }),

      // Financial — invoices (excluding CANCELLED/VOIDED)
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { notIn: ["CANCELLED", "VOIDED"] },
          issuedAt: { gte: from, lte: to },
        },
        _sum: { total: true },
      }),

      // Financial — payments
      this.prisma.payment.aggregate({
        where: { tenantId, paidAt: { gte: from, lte: to } },
        _sum: { amount: true },
      }),

      // Outstanding balance
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: { in: ["ISSUED", "PARTIAL", "OVERDUE"] },
        },
        _sum: { balance: true },
      }),

      // Overdue count
      this.prisma.invoice.count({
        where: { tenantId, status: "OVERDUE" },
      }),

      // Receptions today
      this.prisma.reception.count({
        where: { tenantId, receivedAt: { gte: todayStart, lte: todayEnd } },
      }),

      // Receptions pending pickup
      this.prisma.reception.count({
        where: { tenantId, status: "READY_FOR_PICKUP" },
      }),

      // Pre-alerts pending
      this.prisma.preAlert.count({
        where: { tenantId, status: "PENDING" },
      }),

      // Pre-alerts unmatched (PENDING + no shipment linked)
      this.prisma.preAlert.count({
        where: { tenantId, status: "PENDING", shipmentId: null },
      }),

      // Containers open
      this.prisma.container.count({ where: { tenantId, status: "OPEN" } }),
      this.prisma.container.count({ where: { tenantId, status: "IN_TRANSIT" } }),
      this.prisma.container.count({ where: { tenantId, status: "IN_CUSTOMS" } }),

      // Delivery orders
      this.prisma.deliveryOrder.count({
        where: {
          tenantId,
          status: "PENDING",
          scheduledAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      this.prisma.deliveryOrder.count({
        where: { tenantId, status: "IN_TRANSIT" },
      }),

      this.prisma.deliveryOrder.count({
        where: {
          tenantId,
          status: "DELIVERED",
          deliveredAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      this.prisma.deliveryOrder.count({
        where: {
          tenantId,
          status: "FAILED",
          updatedAt: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

    const byPhase: Record<string, number> = {};
    for (const row of shipmentsByPhase) {
      byPhase[row.currentPhase] = row._count;
    }

    return {
      shipments: {
        total: shipmentTotal,
        byPhase,
        createdToday: shipmentsCreatedToday,
        deliveredToday: shipmentsDeliveredToday,
      },
      customers: {
        total: customerTotal,
        active: customerActive,
        newThisPeriod: customerNew,
      },
      financial: {
        totalInvoiced: Number(invoiceAgg._sum.total ?? 0),
        totalCollected: Number(paymentAgg._sum.amount ?? 0),
        outstandingBalance: Number(outstandingAgg._sum.balance ?? 0),
        overdueCount,
      },
      receptions: {
        totalToday: receptionsToday,
        pendingPickup: receptionsPendingPickup,
      },
      preAlerts: {
        pending: preAlertsPending,
        unmatched: preAlertsUnmatched,
      },
      containers: {
        open: containersOpen,
        inTransit: containersInTransit,
        inCustoms: containersInCustoms,
      },
      deliveryOrders: {
        pendingToday: doPendingToday,
        inTransitNow: doInTransit,
        deliveredToday: doDeliveredToday,
        failedToday: doFailedToday,
      },
    };
  }

  /* ─── b) Shipments by phase ─── */

  async getShipmentsByPhase(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.ShipmentWhereInput = { tenantId };
    if (dateFrom || dateTo) {
      const { from, to } = this.defaultDateRange(dateFrom, dateTo);
      where.createdAt = { gte: from, lte: to };
    }

    const groups = await this.prisma.shipment.groupBy({
      by: ["currentPhase"],
      where,
      _count: true,
      orderBy: { _count: { currentPhase: "desc" } },
    });

    return {
      data: groups.map((g) => ({ phase: g.currentPhase, count: g._count })),
    };
  }

  /* ─── c) Shipment time series ─── */

  async getShipmentTimeSeries(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
    period: string = "day",
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const rows = await this.prisma.$queryRaw<
      { date: Date; created: bigint; delivered: bigint }[]
    >(Prisma.sql`
      SELECT
        DATE_TRUNC(${period}, s.created_at) AS date,
        COUNT(*) AS created,
        COUNT(*) FILTER (WHERE s.current_phase = 'DELIVERED') AS delivered
      FROM shipments s
      WHERE s.tenant_id = ${tenantId}
        AND s.created_at >= ${from}::timestamp
        AND s.created_at < ${to}::timestamp
      GROUP BY date
      ORDER BY date
    `);

    return {
      data: rows.map((r) => ({
        date: r.date.toISOString().split("T")[0],
        created: Number(r.created),
        delivered: Number(r.delivered),
      })),
    };
  }

  /* ─── d) Revenue time series ─── */

  async getRevenueTimeSeries(
    tenantId: string,
    dateFrom: string,
    dateTo: string,
    period: string = "day",
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    const [invoiceRows, paymentRows] = await Promise.all([
      this.prisma.$queryRaw<{ date: Date; invoiced: number }[]>(Prisma.sql`
        SELECT
          DATE_TRUNC(${period}, issued_at) AS date,
          COALESCE(SUM(total), 0)::float AS invoiced
        FROM invoices
        WHERE tenant_id = ${tenantId}
          AND status NOT IN ('CANCELLED', 'VOIDED')
          AND issued_at >= ${from}::timestamp
          AND issued_at < ${to}::timestamp
        GROUP BY date
        ORDER BY date
      `),
      this.prisma.$queryRaw<{ date: Date; collected: number }[]>(Prisma.sql`
        SELECT
          DATE_TRUNC(${period}, paid_at) AS date,
          COALESCE(SUM(amount), 0)::float AS collected
        FROM payments
        WHERE tenant_id = ${tenantId}
          AND paid_at >= ${from}::timestamp
          AND paid_at < ${to}::timestamp
        GROUP BY date
        ORDER BY date
      `),
    ]);

    // Merge into single timeline
    const map = new Map<string, { invoiced: number; collected: number }>();
    for (const r of invoiceRows) {
      const key = r.date.toISOString().split("T")[0];
      map.set(key, { invoiced: Number(r.invoiced), collected: 0 });
    }
    for (const r of paymentRows) {
      const key = r.date.toISOString().split("T")[0];
      const existing = map.get(key) ?? { invoiced: 0, collected: 0 };
      existing.collected = Number(r.collected);
      map.set(key, existing);
    }

    const data = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    return { data };
  }

  /* ─── e) Top customers ─── */

  async getTopCustomers(
    tenantId: string,
    dateFrom?: string,
    dateTo?: string,
    limit: number = 10,
  ) {
    const { from, to } = this.defaultDateRange(dateFrom, dateTo);

    const rows = await this.prisma.$queryRaw<
      {
        customer_id: string;
        customer_name: string;
        casillero: string;
        shipment_count: bigint;
        total_invoiced: number;
        total_paid: number;
      }[]
    >(Prisma.sql`
      SELECT
        c.id AS customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.casillero,
        COUNT(DISTINCT s.id) AS shipment_count,
        COALESCE(inv.total_invoiced, 0)::float AS total_invoiced,
        COALESCE(pay.total_paid, 0)::float AS total_paid
      FROM customers c
      LEFT JOIN shipments s
        ON s.customer_id = c.id
        AND s.tenant_id = ${tenantId}
        AND s.created_at >= ${from}::timestamp
        AND s.created_at < ${to}::timestamp
      LEFT JOIN LATERAL (
        SELECT SUM(i.total)::float AS total_invoiced
        FROM invoices i
        WHERE i.customer_id = c.id
          AND i.tenant_id = ${tenantId}
          AND i.status NOT IN ('CANCELLED', 'VOIDED')
          AND i.issued_at >= ${from}::timestamp
          AND i.issued_at < ${to}::timestamp
      ) inv ON true
      LEFT JOIN LATERAL (
        SELECT SUM(p.amount)::float AS total_paid
        FROM payments p
        WHERE p.customer_id = c.id
          AND p.tenant_id = ${tenantId}
          AND p.paid_at >= ${from}::timestamp
          AND p.paid_at < ${to}::timestamp
      ) pay ON true
      WHERE c.tenant_id = ${tenantId}
      GROUP BY c.id, c.first_name, c.last_name, c.casillero, inv.total_invoiced, pay.total_paid
      ORDER BY shipment_count DESC
      LIMIT ${limit}
    `);

    return {
      data: rows.map((r) => ({
        customerId: r.customer_id,
        customerName: r.customer_name,
        casillero: r.casillero,
        shipmentCount: Number(r.shipment_count),
        totalInvoiced: Number(r.total_invoiced),
        totalPaid: Number(r.total_paid),
      })),
    };
  }

  /* ─── f) Receptions by branch ─── */

  async getReceptionsByBranch(tenantId: string, dateFrom?: string, dateTo?: string) {
    const { from, to } = this.defaultDateRange(dateFrom, dateTo);

    const rows = await this.prisma.$queryRaw<
      {
        branch_id: string;
        branch_name: string;
        branch_code: string;
        count: bigint;
        total_weight: number;
        total_charges: number;
      }[]
    >(Prisma.sql`
      SELECT
        b.id AS branch_id,
        b.name AS branch_name,
        b.code AS branch_code,
        COUNT(r.id) AS count,
        COALESCE(SUM(r.weight_lbs), 0)::float AS total_weight,
        COALESCE(SUM(r.total_charge), 0)::float AS total_charges
      FROM branches b
      LEFT JOIN receptions r
        ON r.branch_id = b.id
        AND r.tenant_id = ${tenantId}
        AND r.received_at >= ${from}::timestamp
        AND r.received_at < ${to}::timestamp
      WHERE b.tenant_id = ${tenantId}
      GROUP BY b.id, b.name, b.code
      ORDER BY count DESC
    `);

    return {
      data: rows.map((r) => ({
        branchId: r.branch_id,
        branchName: r.branch_name,
        branchCode: r.branch_code,
        count: Number(r.count),
        totalWeight: Number(r.total_weight),
        totalCharges: Number(r.total_charges),
      })),
    };
  }

  /* ─── g) Container stats ─── */

  async getContainerStats(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.ContainerWhereInput = { tenantId };
    if (dateFrom || dateTo) {
      const { from, to } = this.defaultDateRange(dateFrom, dateTo);
      where.createdAt = { gte: from, lte: to };
    }

    const [totalContainers, byMode, byStatus, aggregates, avgTransitResult] =
      await Promise.all([
        this.prisma.container.count({ where }),

        this.prisma.container.groupBy({
          by: ["mode"],
          where,
          _count: true,
        }),

        this.prisma.container.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),

        this.prisma.container.aggregate({
          where,
          _sum: { totalPieces: true, totalWeightLbs: true },
        }),

        this.prisma.$queryRaw<{ avg_days: number }[]>(Prisma.sql`
          SELECT
            COALESCE(AVG(EXTRACT(EPOCH FROM (actual_arrival - actual_departure)) / 86400), 0)::float AS avg_days
          FROM containers
          WHERE tenant_id = ${tenantId}
            AND actual_departure IS NOT NULL
            AND actual_arrival IS NOT NULL
        `),
      ]);

    const modeMap: Record<string, number> = {};
    for (const r of byMode) modeMap[r.mode] = r._count;

    const statusMap: Record<string, number> = {};
    for (const r of byStatus) statusMap[r.status] = r._count;

    return {
      data: {
        totalContainers,
        byMode: modeMap,
        byStatus: statusMap,
        totalPieces: aggregates._sum.totalPieces ?? 0,
        totalWeightLbs: Number(aggregates._sum.totalWeightLbs ?? 0),
        avgTransitDays: Number(avgTransitResult[0]?.avg_days ?? 0),
      },
    };
  }

  /* ─── h) Delivery performance ─── */

  async getDeliveryPerformance(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.DeliveryOrderWhereInput = { tenantId };
    if (dateFrom || dateTo) {
      const { from, to } = this.defaultDateRange(dateFrom, dateTo);
      where.createdAt = { gte: from, lte: to };
    }

    const [total, byStatus, byType, avgTimeResult] = await Promise.all([
      this.prisma.deliveryOrder.count({ where }),

      this.prisma.deliveryOrder.groupBy({
        by: ["status"],
        where,
        _count: true,
      }),

      this.prisma.deliveryOrder.groupBy({
        by: ["deliveryType"],
        where,
        _count: true,
      }),

      this.prisma.$queryRaw<{ avg_hours: number }[]>(Prisma.sql`
        SELECT
          COALESCE(AVG(EXTRACT(EPOCH FROM (delivered_at - created_at)) / 3600), 0)::float AS avg_hours
        FROM delivery_orders
        WHERE tenant_id = ${tenantId}
          AND delivered_at IS NOT NULL
      `),
    ]);

    const statusMap: Record<string, number> = {};
    for (const r of byStatus) statusMap[r.status] = r._count;

    const typeMap: Record<string, number> = {};
    for (const r of byType) typeMap[r.deliveryType] = r._count;

    const delivered = statusMap["DELIVERED"] ?? 0;
    const failed = statusMap["FAILED"] ?? 0;
    const successRate =
      delivered + failed > 0
        ? Math.round((delivered / (delivered + failed)) * 10000) / 100
        : 0;

    return {
      data: {
        total,
        delivered,
        failed,
        successRate,
        avgDeliveryTimeHours: Number(avgTimeResult[0]?.avg_hours ?? 0),
        byType: typeMap,
        byStatus: statusMap,
      },
    };
  }

  /* ─── i) DGA summary ─── */

  async getDgaSummary(
    tenantId: string,
    containerId?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: Prisma.DgaLabelWhereInput = { tenantId };
    if (containerId) where.containerId = containerId;
    if (dateFrom || dateTo) {
      const { from, to } = this.defaultDateRange(dateFrom, dateTo);
      where.createdAt = { gte: from, lte: to };
    }

    const [totalLabels, byStatus, aggregates, taxExemptCount, avgProcessingResult] =
      await Promise.all([
        this.prisma.dgaLabel.count({ where }),

        this.prisma.dgaLabel.groupBy({
          by: ["status"],
          where,
          _count: true,
        }),

        this.prisma.dgaLabel.aggregate({
          where,
          _sum: { fobValue: true, totalTaxes: true },
        }),

        this.prisma.dgaLabel.count({ where: { ...where, taxExempt: true } }),

        this.prisma.$queryRaw<{ avg_days: number }[]>(Prisma.sql`
          SELECT
            COALESCE(AVG(EXTRACT(EPOCH FROM (cleared_at - created_at)) / 86400), 0)::float AS avg_days
          FROM dga_labels
          WHERE tenant_id = ${tenantId}
            AND cleared_at IS NOT NULL
        `),
      ]);

    const statusMap: Record<string, number> = {};
    for (const r of byStatus) statusMap[r.status] = r._count;

    return {
      data: {
        totalLabels,
        byStatus: statusMap,
        totalFobValue: Number(aggregates._sum.fobValue ?? 0),
        totalTaxes: Number(aggregates._sum.totalTaxes ?? 0),
        taxExemptCount,
        avgProcessingDays: Number(avgProcessingResult[0]?.avg_days ?? 0),
      },
    };
  }

  /* ─── j) Payment method breakdown ─── */

  async getPaymentMethodBreakdown(tenantId: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.PaymentWhereInput = { tenantId };
    if (dateFrom || dateTo) {
      const { from, to } = this.defaultDateRange(dateFrom, dateTo);
      where.paidAt = { gte: from, lte: to };
    }

    const groups = await this.prisma.payment.groupBy({
      by: ["method"],
      where,
      _count: true,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    return {
      data: groups.map((g) => ({
        method: g.method,
        count: g._count,
        total: Number(g._sum.amount ?? 0),
      })),
    };
  }
}
