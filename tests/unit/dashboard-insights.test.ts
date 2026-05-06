import { describe, expect, it } from "vitest";

import { buildDashboardDueInsights } from "@/features/dashboard/lib/insights";
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
  status: "unpaid",
  $createdAt: "2026-05-01T00:00:00.000Z",
  $updatedAt: "2026-05-02T00:00:00.000Z",
  paidAt: null,
};

describe("dashboard due insights", () => {
  it("separates overdue and due-soon unpaid invoices in urgency order", () => {
    const paidInvoice: Invoice = {
      ...baseInvoice,
      id: "paid",
      status: "paid",
      dueDate: "2026-04-01T00:00:00.000Z",
      paidAt: "2026-04-01T00:00:00.000Z",
    };
    const overdueSooner: Invoice = {
      ...baseInvoice,
      id: "overdue-1",
      dueDate: "2026-05-04T00:00:00.000Z",
    };
    const overdueEarlier: Invoice = {
      ...baseInvoice,
      id: "overdue-2",
      dueDate: "2026-04-28T00:00:00.000Z",
    };
    const dueSoon: Invoice = {
      ...baseInvoice,
      id: "soon",
      dueDate: "2026-05-08T00:00:00.000Z",
    };
    const later: Invoice = {
      ...baseInvoice,
      id: "later",
      dueDate: "2026-05-30T00:00:00.000Z",
    };

    const insights = buildDashboardDueInsights(
      [dueSoon, later, overdueSooner, paidInvoice, overdueEarlier],
      new Date("2026-05-05T12:00:00.000Z"),
    );

    expect(insights.overdue.map(({ invoice }) => invoice.id)).toEqual([
      "overdue-2",
      "overdue-1",
    ]);
    expect(insights.dueSoon.map(({ invoice }) => invoice.id)).toEqual(["soon"]);
  });
});
