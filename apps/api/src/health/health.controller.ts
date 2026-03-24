import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { Public } from "@/common/decorators/public.decorator";
import { PrismaService } from "@/prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @Get("live")
  @ApiOperation({ summary: "Liveness (sin dependencias)" })
  live() {
    return { status: "ok", ts: new Date().toISOString() };
  }

  @Public()
  @Get("ready")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness (incluye base de datos)" })
  ready() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { prisma: { status: "up" } };
      },
    ]);
  }
}
