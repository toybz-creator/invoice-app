"use client";

import { RefreshCw } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { useInvoiceSnapshot } from "@/features/invoices/components/invoice-data-provider";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import { InvoiceWorkspaceToolbar } from "@/features/invoices/components/invoice-workspace-toolbar";
import { invoiceCode } from "@/features/invoices/lib/display";
import {
  type InvoiceFilter,
  useInvoiceUiStore,
} from "@/stores/invoice-ui.store";

const filters: Array<{ label: string; value: InvoiceFilter }> = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
];

const pageSizeOptions = [5, 8, 10, 20];

export function InvoicesWorkspace() {
  const { invoices, loadError } = useInvoiceSnapshot();
  const filter = useInvoiceUiStore((state) => state.filter);
  const search = useInvoiceUiStore((state) => state.search);
  const pageSize = useInvoiceUiStore((state) => state.pageSize);

  const setFilter = useInvoiceUiStore((state) => state.setFilter);
  const setSearch = useInvoiceUiStore((state) => state.setSearch);
  const setPageSize = useInvoiceUiStore((state) => state.setPageSize);
  const openCreate = useInvoiceUiStore((state) => state.openCreate);

  const filteredInvoices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesFilter = filter === "all" || invoice.status === filter;
      const matchesSearch =
        !normalizedSearch ||
        invoice.clientName.toLowerCase().includes(normalizedSearch) ||
        invoice.clientEmail.toLowerCase().includes(normalizedSearch) ||
        invoice.id.toLowerCase().includes(normalizedSearch) ||
        invoiceCode(invoice.id).toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, invoices, search]);

  return (
    <div className="space-y-9">
      <InvoiceWorkspaceToolbar
        search={search}
        filter={filter}
        pageSize={pageSize}
        filters={filters}
        pageSizeOptions={pageSizeOptions}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
        onPageSizeChange={setPageSize}
        onCreate={openCreate}
      />

      {loadError ? (
        <section
          className="flex flex-col gap-3 rounded-[15px] border border-[#ffe2c7] bg-[#fff7f0] px-5 py-4 text-sm text-[#a85f14] md:flex-row md:items-center md:justify-between"
          role="status"
        >
          <div>
            <p className="font-semibold text-[#1b212d]">
              Invoice data is temporarily unavailable
            </p>
            <p className="mt-1 text-[#a85f14]">{loadError}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 rounded-[10px] border-[#ffd2a8] bg-white text-[#1b212d] hover:bg-[#fff2e6]"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </section>
      ) : null}

      <section>
        <InvoiceTable
          invoices={filteredInvoices}
          emptyTitle="No invoices found"
          emptyDescription={
            loadError
              ? "The table will appear here once invoice data loads again."
              : "Create an invoice or adjust the current search and filters."
          }
          showPagination
        />
      </section>
    </div>
  );
}

