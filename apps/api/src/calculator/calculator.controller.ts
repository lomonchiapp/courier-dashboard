import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { CalculatorService } from "./calculator.service";
import { EstimateDto } from "./dto/estimate.dto";

@ApiTags("calculator")
@Controller("calculator")
export class CalculatorController {
  constructor(private readonly calculator: CalculatorService) {}

  @Post("estimate")
  @Public()
  @ApiOperation({ summary: "Estimar costo de envío" })
  @ApiHeader({ name: "X-Tenant-Id", required: true })
  estimate(
    @Headers("x-tenant-id") tenantId: string,
    @Body() dto: EstimateDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException("X-Tenant-Id header is required");
    }
    return this.calculator.estimate(tenantId, dto);
  }
}
