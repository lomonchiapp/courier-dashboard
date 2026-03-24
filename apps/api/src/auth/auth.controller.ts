import { BadRequestException, Body, Controller, Headers, Post } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ExchangeTokenDto } from "./dto/exchange-token.dto";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("token")
  @ApiOperation({
    summary: "Intercambiar API key por JWT",
    description:
      "Envía la API key en el cuerpo y X-Tenant-Id en cabecera. Devuelve un Bearer JWT para usar en Authorization.",
  })
  @ApiHeader({ name: "X-Tenant-Id", required: true })
  async exchange(
    @Body() dto: ExchangeTokenDto,
    @Headers("x-tenant-id") tenantId: string | undefined
  ) {
    if (!tenantId || typeof tenantId !== "string") {
      throw new BadRequestException("Missing X-Tenant-Id header");
    }
    const key = await this.auth.validateApiKey(dto.apiKey, tenantId);
    const access_token = this.auth.issueAccessToken(key.id, key.tenantId, key.role);
    return {
      access_token,
      token_type: "Bearer" as const,
      expires_in: 86400,
    };
  }
}
