"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";
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
import { InvoiceClientCell } from "@/features/invoices/components/invoice-client-cell";
import { InvoiceTableActions } from "@/features/invoices/components/invoice-table-actions";
import { StatusBadge } from "@/features/invoices/components/status-badge";
import {
  formatInvoiceDate,
  getDueDateState,
} from "@/features/invoices/lib/dates";
import { getOrderType } from "@/features/invoices/lib/display";
import { formatNaira } from "@/features/invoices/lib/finance";
import { cn } from "@/lib/utils";
import { useInvoiceUiStore } from "@/stores/invoice-ui.store";
import type { Invoice } from "@/types/invoice";

type InvoiceTableProps = {
  invoices: Invoice[];
  emptyTitle: string;
  emptyDescription: string;
  showPagination?: boolean;
};

function dueToneClass(tone: ReturnType<typeof getDueDateState>["tone"]) {
  return cn(
    tone === "danger" && "text-red-700",
    tone === "warning" && "text-amber-700",
    tone === "success" && "text-emerald-700",
    tone === "neutral" && "text-[#929eae]",
  );
}

function InvoiceDesktopRow({
  invoice,
  activeInvoiceId,
  isPending,
  onToggleMenu,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: {
  invoice: Invoice;
  activeInvoiceId: string | null;
  isPending: boolean;
  onToggleMenu: (invoiceId: string) => void;
  onView: (invoiceId: string) => void;
  onEdit: (invoiceId: string) => void;
  onStatus: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
}) {
  const dueState = getDueDateState(invoice.dueDate, invoice.status);

  return (
    <li className="grid min-h-[78px] grid-cols-[minmax(230px,1.5fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_90px] items-center gap-[30px] text-sm text-[#1b212d]">
      <InvoiceClientCell invoice={invoice} onOpen={() => onView(invoice.id)} />

      <div>
        <p className="text-sm font-medium text-[#1b212d]">
          {formatInvoiceDate(invoice.$createdAt)}
        </p>
        <p className={cn("mt-1 text-xs", dueToneClass(dueState.tone))}>
          {dueState.label}
        </p>
      </div>

      <p className="text-sm font-semibold text-[#929eae]">
        {getOrderType(invoice)}
      </p>

      <p className="font-mono text-sm font-semibold text-[#1b212d]">
        {formatNaira(invoice.total)}
      </p>

      <StatusBadge status={invoice.status} />

      <InvoiceTableActions
        mode="interactive"
        invoice={invoice}
        isMenuOpen={activeInvoiceId === invoice.id}
        isPending={isPending}
        onToggleMenu={() => onToggleMenu(invoice.id)}
        onView={() => onView(invoice.id)}
        onEdit={() => onEdit(invoice.id)}
        onStatus={() => onStatus(invoice)}
        onDelete={() => onDelete(invoice.id)}
      />
    </li>
  );
}

function InvoiceMobileCard({
  invoice,
  activeInvoiceId,
  isPending,
  onToggleMenu,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: {
  invoice: Invoice;
  activeInvoiceId: string | null;
  isPending: boolean;
  onToggleMenu: (invoiceId: string) => void;
  onView: (invoiceId: string) => void;
  onEdit: (invoiceId: string) => void;
  onStatus: (invoice: Invoice) => void;
  onDelete: (invoiceId: string) => void;
}) {
  const dueState = getDueDateState(invoice.dueDate, invoice.status);

  return (
    <li className="rounded-[15px] border border-[#f5f5f5] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <InvoiceClientCell invoice={invoice} onOpen={() => onView(invoice.id)} />

        <div className="shrink-0">
          <InvoiceTableActions
            mode="interactive"
            invoice={invoice}
            isMenuOpen={activeInvoiceId === invoice.id}
            isPending={isPending}
            onToggleMenu={() => onToggleMenu(invoice.id)}
            onView={() => onView(invoice.id)}
            onEdit={() => onEdit(invoice.id)}
            onStatus={() => onStatus(invoice)}
            onDelete={() => onDelete(invoice.id)}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-[#929eae]">Date</p>
          <p className="mt-1 font-medium text-[#1b212d]">
            {formatInvoiceDate(invoice.$createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#929eae]">
            Amount
          </p>
          <p className="mt-1 font-mono font-semibold text-[#1b212d]">
            {formatNaira(invoice.total)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#929eae]">Due</p>
          <p className={cn("mt-1 text-xs", dueToneClass(dueState.tone))}>
            {dueState.label}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#929eae]">
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={invoice.status} />
          </div>
        </div>
      </div>
    </li>
  );
}

function InvoiceTablePagination({
  showingStart,
  showingEnd,
  total,
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  showingStart: number;
  showingEnd: number;
  total: number;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[#f5f5f5] pt-5 text-sm text-[#929eae] md:flex-row md:items-center md:justify-between">
      <p>
        Showing {showingStart}-{showingEnd} of {total} invoices
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrevious}
          className="rounded-[10px] border-[#f5f5f5]"
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="rounded-[10px] bg-[#fafafa] px-3 py-2 text-[#1b212d]">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={onNext}
          className="rounded-[10px] border-[#f5f5f5]"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function InvoiceTable({
  invoices,
  emptyTitle,
  emptyDescription,
  showPagination = false,
}: InvoiceTableProps) {
  const [isPending, startTransition] = useTransition();
  const {
    invoices: allInvoices,
    upsertInvoice,
    removeInvoice,
  } = useInvoiceSnapshot();

  const page = useInvoiceUiStore((state) => state.page);
  const pageSize = useInvoiceUiStore((state) => state.pageSize);
  const viewingInvoiceId = useInvoiceUiStore((state) => state.viewingInvoiceId);
  const editingInvoiceId = useInvoiceUiStore((state) => state.editingInvoiceId);
  const deletingInvoiceId = useInvoiceUiStore(
    (state) => state.deletingInvoiceId,
  );
  const actionMenuInvoiceId = useInvoiceUiStore(
    (state) => state.actionMenuInvoiceId,
  );

  const setPage = useInvoiceUiStore((state) => state.setPage);
  const openView = useInvoiceUiStore((state) => state.openView);
  const closeView = useInvoiceUiStore((state) => state.closeView);
  const openEdit = useInvoiceUiStore((state) => state.openEdit);
  const closeEdit = useInvoiceUiStore((state) => state.closeEdit);
  const openDelete = useInvoiceUiStore((state) => state.openDelete);
   const closeDelete = useInvoiceUiStore((state) => state.closeDelete);
   const toggleActionMenu = useInvoiceUiStore((state) => state.toggleActionMenu);
   const closeActionMenu = useInvoiceUiStore((state) => state.closeActionMenu);
 
   const createOpen = useInvoiceUiStore((state) => state.createOpen);
   const closeCreate = useInvoiceUiStore((state) => state.closeCreate);
 
   const viewingInvoice = allInvoices.find(
     (invoice) => invoice.id === viewingInvoiceId,
   );
  const editingInvoice = allInvoices.find(
    (invoice) => invoice.id === editingInvoiceId,
  );
  const deletingInvoice = allInvoices.find(
    (invoice) => invoice.id === deletingInvoiceId,
  );

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;

  const paginatedInvoices = showPagination
    ? invoices.slice(pageStart, pageStart + pageSize)
    : invoices;

  const showingStart = invoices.length === 0 ? 0 : pageStart + 1;
  const showingEnd = Math.min(pageStart + pageSize, invoices.length);

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

  if (invoices.length === 0) {
    return (
      <div className="rounded-[15px] border border-[#f5f5f5] px-5 py-16 text-center">
        <p className="text-sm font-medium">{emptyTitle}</p>
        <p className="mt-1 text-sm text-[#929eae]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="grid grid-cols-[minmax(230px,1.5fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_90px] gap-[30px] py-4 text-xs font-semibold uppercase text-[#929eae]">
          <span>Name/client</span>
          <span>Date</span>
          <span>Orders/type</span>
          <span>Amount</span>
          <span>Status</span>
          <span className="text-center">Action</span>
        </div>

        <ul className="divide-y divide-[#f5f5f5]">
          {paginatedInvoices.map((invoice) => (
            <InvoiceDesktopRow
              key={invoice.id}
              invoice={invoice}
              activeInvoiceId={actionMenuInvoiceId}
              isPending={isPending}
              onToggleMenu={toggleActionMenu}
              onView={openView}
              onEdit={openEdit}
              onStatus={updateStatus}
              onDelete={openDelete}
            />
          ))}
        </ul>
      </div>

      <ul className="space-y-3 lg:hidden">
        {paginatedInvoices.map((invoice) => (
          <InvoiceMobileCard
            key={invoice.id}
            invoice={invoice}
            activeInvoiceId={actionMenuInvoiceId}
            isPending={isPending}
            onToggleMenu={toggleActionMenu}
            onView={openView}
            onEdit={openEdit}
            onStatus={updateStatus}
            onDelete={openDelete}
          />
        ))}
      </ul>

      {showPagination ? (
         <InvoiceTablePagination
           showingStart={showingStart}
           showingEnd={showingEnd}
           total={invoices.length}
           page={safePage}
           totalPages={totalPages}
           onPrevious={() => setPage(safePage - 1)}
           onNext={() => setPage(safePage + 1)}
         />
       ) : null}
 
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
    </>
  );
}

