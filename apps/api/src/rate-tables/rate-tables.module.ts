import { Module } from "@nestjs/common";
import { RateTablesController } from "./rate-tables.controller";
import { RateTablesService } from "./rate-tables.service";

@Module({
  controllers: [RateTablesController],
  providers: [RateTablesService],
  exports: [RateTablesService],
})
export class RateTablesModule {}
