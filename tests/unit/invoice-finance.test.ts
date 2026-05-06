import { describe, expect, it } from "vitest";

import {
  aggregateDashboardMetrics,
  calculateInvoiceFinancials,
  calculateInvoiceTotal,
  calculateVatAmount,
} from "@/features/invoices/lib/finance";
import type { Invoice } from "@/types/invoice";

const baseInvoice: Invoice = {
  id: "invoice-1",
  userId: "user-1",
  clientName: "Acme",
  clientEmail: "billing@acme.test",
  amount: 1000,
  vatRate: 7.5,
  vatAmount: 75,
  total: 1075,
  dueDate: "2026-05-20T00:00:00.000Z",
  status: "paid",
  $createdAt: "2026-05-01T00:00:00.000Z",
  $updatedAt: "2026-05-02T00:00:00.000Z",
  paidAt: "2026-05-02T00:00:00.000Z",
};

describe("invoice finance utilities", () => {
  it("calculates VAT and total with currency rounding", () => {
    expect(calculateVatAmount(199.99, 7.5)).toBe(15);
    expect(calculateInvoiceTotal(199.99, 7.5)).toBe(214.99);
    expect(calculateInvoiceFinancials(199.999, 7.555)).toMatchObject({
      amount: 200,
      vatRate: 7.56,
      vatAmount: 15.12,
      total: 215.12,
    });
  });

  it("aggregates paid revenue, pending payments, and paid VAT", () => {
    const unpaidInvoice: Invoice = {
      ...baseInvoice,
      id: "invoice-2",
      status: "unpaid",
      total: 2150,
      vatAmount: 150,
      paidAt: null,
    };

    expect(
      aggregateDashboardMetrics(
        [baseInvoice, unpaidInvoice],
        new Date("2026-05-05T12:00:00.000Z"),
      ),
    ).toEqual({
      totalInvoices: 2,
      paidRevenue: 1075,
      pendingPayments: 2150,
      vatCollected: 75,
      payableVatThisMonth: 75,
      paidCount: 1,
      unpaidCount: 1,
    });
  });
});
