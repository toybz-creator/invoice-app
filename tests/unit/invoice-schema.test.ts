import { describe, expect, it } from "vitest";

import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
} from "@/features/invoices/schemas/invoice.schema";

describe("invoice schemas", () => {
  it("accepts valid create invoice input and coerces numbers", () => {
    expect(
      createInvoiceSchema.parse({
        clientName: "Gadget Gallery LTD",
        clientEmail: "accounts@gadget.test",
        amount: "5000.50",
        vatRate: "7.5",
        dueDate: "2026-05-30",
        status: "unpaid",
      }),
    ).toMatchObject({
      amount: 5000.5,
      vatRate: 7.5,
    });
  });

  it("rejects impossible amounts, VAT rates, dates, and statuses", () => {
    expect(
      createInvoiceSchema.safeParse({
        clientName: "",
        clientEmail: "bad-email",
        amount: "-1",
        vatRate: "101",
        dueDate: "not-a-date",
        status: "pending",
      }).success,
    ).toBe(false);

    expect(
      updateInvoiceStatusSchema.safeParse({
        id: "invoice-1",
        status: "pending",
      }).success,
    ).toBe(false);
  });
});
