import { describe, expect, it } from "vitest";

import { useInvoiceUiStore } from "@/stores/invoice-ui.store";

describe("invoice UI store", () => {
  it("keeps filter and dialog state local to UI concerns", () => {
    useInvoiceUiStore.getState().resetInvoiceUi();

    useInvoiceUiStore.getState().setFilter("paid");
    useInvoiceUiStore.getState().setSearch("acme");
    useInvoiceUiStore.getState().setPage(2);
    useInvoiceUiStore.getState().setPageSize(12);
    useInvoiceUiStore.getState().openCreate();
    useInvoiceUiStore.getState().openView("invoice-0");
    useInvoiceUiStore.getState().openEdit("invoice-1");
    useInvoiceUiStore.getState().openDelete("invoice-2");
    useInvoiceUiStore.getState().toggleActionMenu("invoice-3");

    expect(useInvoiceUiStore.getState()).toMatchObject({
      filter: "paid",
      search: "acme",
      page: 1,
      pageSize: 12,
      createOpen: true,
      viewingInvoiceId: "invoice-0",
      editingInvoiceId: "invoice-1",
      deletingInvoiceId: "invoice-2",
      actionMenuInvoiceId: "invoice-3",
    });

    useInvoiceUiStore.getState().resetInvoiceUi();

    expect(useInvoiceUiStore.getState()).toMatchObject({
      filter: "all",
      search: "",
      page: 1,
      pageSize: 8,
      createOpen: false,
      viewingInvoiceId: null,
      editingInvoiceId: null,
      deletingInvoiceId: null,
      actionMenuInvoiceId: null,
    });
  });
});
