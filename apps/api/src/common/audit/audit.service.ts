import { Injectable, Logger } from "@nestjs/common";
import { ActorType } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";

export interface AuditEntry {
  tenantId: string;
  actor: string;
  actorType: ActorType;
  action: string;
  resource: string;
  resourceId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget audit log — never blocks the request */
  log(entry: AuditEntry): void {
    this.prisma.auditLog
      .create({
        data: {
          tenantId: entry.tenantId,
          actor: entry.actor,
          actorType: entry.actorType,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          meta: (entry.meta ?? {}) as any,
          ip: entry.ip,
        },
      })
      .catch((err) => this.logger.error("Audit log failed", err));
  }
}
