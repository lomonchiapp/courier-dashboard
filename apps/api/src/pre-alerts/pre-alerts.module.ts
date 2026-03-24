import { Module } from "@nestjs/common";
import { PreAlertsService } from "./pre-alerts.service";
import { PreAlertsController } from "./pre-alerts.controller";
import { PreAlertsCustomerController } from "./pre-alerts-customer.controller";

@Module({
  controllers: [PreAlertsController, PreAlertsCustomerController],
  providers: [PreAlertsService],
  exports: [PreAlertsService],
})
export class PreAlertsModule {}
