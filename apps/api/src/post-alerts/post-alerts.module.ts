import { Module } from "@nestjs/common";
import { PostAlertsController } from "./post-alerts.controller";
import { PostAlertsService } from "./post-alerts.service";

@Module({
  controllers: [PostAlertsController],
  providers: [PostAlertsService],
  exports: [PostAlertsService],
})
export class PostAlertsModule {}
