import { Module } from "@nestjs/common";
import { CustomerAuthGuard } from "@/common/guards/customer-auth.guard";
import { CustomersController } from "./customers.controller";
import { CustomersMeController } from "./customers-me.controller";
import { CustomersService } from "./customers.service";
import { CustomerAuthService } from "./customer-auth.service";

@Module({
  controllers: [CustomersController, CustomersMeController],
  providers: [CustomersService, CustomerAuthService, CustomerAuthGuard],
  exports: [CustomersService, CustomerAuthService],
})
export class CustomersModule {}
