import { Module } from "@nestjs/common";
import { DgaController } from "./dga.controller";
import { DgaService } from "./dga.service";

@Module({
  controllers: [DgaController],
  providers: [DgaService],
  exports: [DgaService],
})
export class DgaModule {}
