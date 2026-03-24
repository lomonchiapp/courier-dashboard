import { Module } from "@nestjs/common";
import {
  ReceptionsController,
  CustomerReceptionsController,
} from "./receptions.controller";
import { ReceptionsService } from "./receptions.service";

@Module({
  controllers: [ReceptionsController, CustomerReceptionsController],
  providers: [ReceptionsService],
  exports: [ReceptionsService],
})
export class ReceptionsModule {}
