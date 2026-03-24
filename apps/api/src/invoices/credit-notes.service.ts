import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreditNoteStatus, InvoiceStatus, Prisma } from "@prisma/client";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateCreditNoteDto } from "./dto/create-credit-note.dto";

@Injectable()
export class CreditNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateCreditNoteDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException("Invoice not found");

    if (dto.amount > Number(invoice.balance)) {
      throw new BadRequestException(
        `Credit note amount (${dto.amount}) exceeds invoice balance (${invoice.balance})`,
      );
    }

    const count = await this.prisma.creditNote.count({ where: { tenantId } });
    const number = `CN-${String(count + 1).padStart(5, "0")}`;

    return this.prisma.creditNote.create({
      data: {
        tenantId,
        invoiceId: dto.invoiceId,
        number,
        reason: dto.reason,
        amount: dto.amount,
        currency: dto.currency ?? invoice.currency,
      },
    });
  }

  async issue(tenantId: string, id: string) {
    const creditNote = await this.prisma.creditNote.findFirst({
      where: { id, tenantId },
    });
    if (!creditNote) throw new NotFoundException("Credit note not found");

    if (creditNote.status !== CreditNoteStatus.DRAFT) {
      throw new BadRequestException("Only DRAFT credit notes can be issued");
    }

    return this.prisma.$transaction(async (tx) => {
      // Re-validate against current invoice balance
      const invoice = await tx.invoice.findUniqueOrThrow({
        where: { id: creditNote.invoiceId },
      });

      const cnAmount = Number(creditNote.amount);
      if (cnAmount > Number(invoice.balance)) {
        throw new BadRequestException(
          `Credit note amount (${cnAmount}) exceeds current invoice balance (${invoice.balance})`,
        );
      }

      // Apply to invoice
      const newAmountPaid =
        Math.round((Number(invoice.amountPaid) + cnAmount) * 100) / 100;
      const newBalance =
        Math.round((Number(invoice.total) - newAmountPaid) * 100) / 100;

      const newStatus =
        newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      await tx.invoice.update({
        where: { id: creditNote.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balance: Math.max(newBalance, 0),
          status: newStatus,
          ...(newBalance <= 0 ? { paidAt: new Date() } : {}),
        },
      });

      return tx.creditNote.update({
        where: { id },
        data: {
          status: CreditNoteStatus.APPLIED,
          issuedAt: new Date(),
        },
      });
    });
  }

  async list(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.CreditNoteWhereInput = { tenantId };

    const [items, total] = await Promise.all([
      this.prisma.creditNote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          invoice: {
            select: { number: true, total: true, balance: true, customerId: true },
          },
        },
      }),
      this.prisma.creditNote.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
