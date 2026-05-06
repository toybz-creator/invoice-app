import { describe, expect, it } from "vitest";

import { useInvoiceDataStore } from "@/stores/invoice-data.store";
import type { AppwriteInvoiceRow, Invoice } from "@/types/invoice";

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

function toRow(invoice: Invoice): AppwriteInvoiceRow {
  return {
    ...invoice,
    $id: invoice.id,
    $sequence: "1",
    $tableId: "invoices",
    $databaseId: "database",
    $permissions: [],
  };
}

describe("invoice data store", () => {
  it("seeds initial rows and upserts action results without a route refresh", () => {
    useInvoiceDataStore.getState().resetInvoiceData();

    useInvoiceDataStore.getState().setInitialInvoices({
      userId: "user-1",
      invoices: [baseInvoice],
      total: 1,
    });

    useInvoiceDataStore.getState().upsertInvoice({
      ...baseInvoice,
      id: "invoice-2",
      clientName: "Beta",
      $createdAt: "2026-05-03T00:00:00.000Z",
    });

    expect(
      useInvoiceDataStore.getState().invoices.map((item) => item.id),
    ).toEqual(["invoice-2", "invoice-1"]);
    expect(useInvoiceDataStore.getState().total).toBe(2);

    useInvoiceDataStore.getState().upsertInvoice({
      ...baseInvoice,
      clientName: "Acme Updated",
    });

    expect(useInvoiceDataStore.getState().invoices).toHaveLength(2);
    expect(useInvoiceDataStore.getState().invoices[1]?.clientName).toBe(
      "Acme Updated",
    );
    expect(useInvoiceDataStore.getState().total).toBe(2);
  });

  it("applies owner-filtered realtime rows and deletes by row id", () => {
    useInvoiceDataStore.getState().resetInvoiceData();
    useInvoiceDataStore.getState().setInitialInvoices({
      userId: "user-1",
      invoices: [baseInvoice],
      total: 1,
    });

    const otherUserRow: AppwriteInvoiceRow = {
      ...toRow(baseInvoice),
      ...baseInvoice,
      $id: "invoice-foreign",
      userId: "user-2",
    };

    useInvoiceDataStore.getState().applyRealtimePayload(
      {
        type: "create",
        data: otherUserRow,
        timestamp: "2026-05-05T00:00:00.000Z",
      },
      "user-1",
    );

    expect(useInvoiceDataStore.getState().invoices).toHaveLength(1);

    useInvoiceDataStore.getState().applyRealtimePayload(
      {
        type: "delete",
        data: toRow(baseInvoice),
        timestamp: "2026-05-05T00:00:00.000Z",
      },
      "user-1",
    );

    expect(useInvoiceDataStore.getState().invoices).toEqual([]);
    expect(useInvoiceDataStore.getState().total).toBe(0);
  });
});
