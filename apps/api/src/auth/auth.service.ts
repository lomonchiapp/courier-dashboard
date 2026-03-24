import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiKey, ApiRole } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { hashApiKey, safeEqualHex } from "@/common/crypto/api-key-hash";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService
  ) {}

  async validateApiKey(rawKey: string, tenantId: string): Promise<ApiKey> {
    const pepper = this.config.get<string>("apiKeyPepper") ?? "";
    const digest = hashApiKey(rawKey, pepper);

    const candidates = await this.prisma.apiKey.findMany({
      where: { tenantId },
    });

    const match = candidates.find((c) => safeEqualHex(c.keyHash, digest));
    if (!match) {
      throw new UnauthorizedException("Invalid API key");
    }

    await this.prisma.apiKey.update({
      where: { id: match.id },
      data: { lastUsedAt: new Date() },
    });

    return match;
  }

  issueAccessToken(apiKeyId: string, tenantId: string, role: ApiRole): string {
    return this.jwt.sign({
      sub: apiKeyId,
      tenantId,
      role,
    });
  }
}
