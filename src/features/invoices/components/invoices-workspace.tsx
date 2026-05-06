"use client";

import { RefreshCw } from "lucide-react";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteInvoiceAction,
  updateInvoiceStatusAction,
} from "@/app/actions/invoice.actions";
import { Button } from "@/components/ui/button";
import { DeleteInvoiceDialog } from "@/features/invoices/components/delete-invoice-dialog";
import { useInvoiceSnapshot } from "@/features/invoices/components/invoice-data-provider";
import { InvoiceDetailModal } from "@/features/invoices/components/invoice-detail-modal";
import { InvoiceFormModal } from "@/features/invoices/components/invoice-form-modal";
import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import { InvoiceWorkspaceToolbar } from "@/features/invoices/components/invoice-workspace-toolbar";
import { invoiceCode } from "@/features/invoices/lib/display";
import {
  type InvoiceFilter,
  useInvoiceUiStore,
} from "@/stores/invoice-ui.store";
import type { Invoice } from "@/types/invoice";

const filters: Array<{ label: string; value: InvoiceFilter }> = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
];

const pageSizeOptions = [5, 8, 10, 20];

export function InvoicesWorkspace() {
  const [isPending, startTransition] = useTransition();
  const { invoices, loadError, upsertInvoice, removeInvoice } =
    useInvoiceSnapshot();
  const filter = useInvoiceUiStore((state) => state.filter);
  const search = useInvoiceUiStore((state) => state.search);
  const page = useInvoiceUiStore((state) => state.page);
  const pageSize = useInvoiceUiStore((state) => state.pageSize);
  const createOpen = useInvoiceUiStore((state) => state.createOpen);
  const viewingInvoiceId = useInvoiceUiStore((state) => state.viewingInvoiceId);
  const editingInvoiceId = useInvoiceUiStore((state) => state.editingInvoiceId);
  const deletingInvoiceId = useInvoiceUiStore(
    (state) => state.deletingInvoiceId,
  );
  const actionMenuInvoiceId = useInvoiceUiStore(
    (state) => state.actionMenuInvoiceId,
  );
  const setFilter = useInvoiceUiStore((state) => state.setFilter);
  const setSearch = useInvoiceUiStore((state) => state.setSearch);
  const setPage = useInvoiceUiStore((state) => state.setPage);
  const setPageSize = useInvoiceUiStore((state) => state.setPageSize);
  const openCreate = useInvoiceUiStore((state) => state.openCreate);
  const closeCreate = useInvoiceUiStore((state) => state.closeCreate);
  const openView = useInvoiceUiStore((state) => state.openView);
  const closeView = useInvoiceUiStore((state) => state.closeView);
  const openEdit = useInvoiceUiStore((state) => state.openEdit);
  const closeEdit = useInvoiceUiStore((state) => state.closeEdit);
  const openDelete = useInvoiceUiStore((state) => state.openDelete);
  const closeDelete = useInvoiceUiStore((state) => state.closeDelete);
  const toggleActionMenu = useInvoiceUiStore((state) => state.toggleActionMenu);
  const closeActionMenu = useInvoiceUiStore((state) => state.closeActionMenu);

  const viewingInvoice = invoices.find(
    (invoice) => invoice.id === viewingInvoiceId,
  );
  const editingInvoice = invoices.find(
    (invoice) => invoice.id === editingInvoiceId,
  );
  const deletingInvoice = invoices.find(
    (invoice) => invoice.id === deletingInvoiceId,
  );

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

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedInvoices = filteredInvoices.slice(
    pageStart,
    pageStart + pageSize,
  );
  const showingStart = filteredInvoices.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageStart + pageSize, filteredInvoices.length);

  function updateStatus(invoice: Invoice) {
    const nextStatus = invoice.status === "paid" ? "unpaid" : "paid";

    startTransition(async () => {
      const result = await updateInvoiceStatusAction({
        id: invoice.id,
        status: nextStatus,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      upsertInvoice(result.data);
      closeActionMenu();
    });
  }

  function deleteInvoice() {
    if (!deletingInvoice) {
      return;
    }

    startTransition(async () => {
      const result = await deleteInvoiceAction({ id: deletingInvoice.id });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
      removeInvoice(result.data.id);
      closeDelete();
    });
  }

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
          invoices={paginatedInvoices}
          emptyTitle="No invoices found"
          emptyDescription={
            loadError
              ? "The table will appear here once invoice data loads again."
              : "Create an invoice or adjust the current search and filters."
          }
          actionMode={{
            type: "interactive",
            activeInvoiceId: actionMenuInvoiceId,
            isPending,
            onToggleMenu: toggleActionMenu,
            onView: openView,
            onEdit: openEdit,
            onStatus: updateStatus,
            onDelete: openDelete,
          }}
          pagination={{
            showingStart,
            showingEnd,
            total: filteredInvoices.length,
            page: safePage,
            totalPages,
            onPrevious: () => setPage(safePage - 1),
            onNext: () => setPage(safePage + 1),
          }}
        />
      </section>

      {createOpen ? <InvoiceFormModal onClose={closeCreate} /> : null}

      {editingInvoice ? (
        <InvoiceFormModal invoice={editingInvoice} onClose={closeEdit} />
      ) : null}

      {viewingInvoice ? (
        <InvoiceDetailModal
          invoice={viewingInvoice}
          onClose={closeView}
          onEdit={() => {
            closeView();
            openEdit(viewingInvoice.id);
          }}
        />
      ) : null}

      {deletingInvoice ? (
        <DeleteInvoiceDialog
          invoice={deletingInvoice}
          isPending={isPending}
          onCancel={closeDelete}
          onConfirm={deleteInvoice}
        />
      ) : null}
    </div>
  );
}
