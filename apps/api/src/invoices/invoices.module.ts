import { Module } from "@nestjs/common";
import { InvoicesController } from "./invoices.controller";
import { PaymentsController } from "./payments.controller";
import { CreditNotesController } from "./credit-notes.controller";
import { CustomerInvoicesController } from "./customer-invoices.controller";
import { InvoicesService } from "./invoices.service";
import { PaymentsService } from "./payments.service";
import { CreditNotesService } from "./credit-notes.service";

@Module({
  controllers: [
    InvoicesController,
    PaymentsController,
    CreditNotesController,
    CustomerInvoicesController,
  ],
  providers: [InvoicesService, PaymentsService, CreditNotesService],
  exports: [InvoicesService, PaymentsService],
})
export class InvoicesModule {}
