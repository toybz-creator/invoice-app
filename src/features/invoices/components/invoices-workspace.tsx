"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Pencil,
  ReceiptText,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteInvoiceAction,
  updateInvoiceStatusAction,
} from "@/app/actions/invoice.actions";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { StatusBadge } from "@/features/invoices/components/status-badge";
import {
  formatInvoiceDate,
  getDueDateState,
} from "@/features/invoices/lib/dates";
import {
  calculateInvoiceFinancials,
  formatNaira,
} from "@/features/invoices/lib/finance";
import { cn } from "@/lib/utils";
import {
  type InvoiceFilter,
  useInvoiceUiStore,
} from "@/stores/invoice-ui.store";
import type { Invoice } from "@/types/invoice";

type InvoicesWorkspaceProps = {
  invoices: Invoice[];
  loadError?: string;
};

const filters: Array<{ label: string; value: InvoiceFilter }> = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
];

const pageSizeOptions = [5, 8, 10, 20];

function invoiceCode(id: string) {
  return `MGL${id
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

function invoiceDisplayCode(id: string) {
  return `Inv: ${invoiceCode(id)}`;
}

function getOrderType(invoice: Invoice) {
  if (invoice.vatRate === 0) {
    return "Withdraw";
  }

  return invoice.status === "paid" ? "01" : "20";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1b212d]/45 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="mx-auto min-h-full w-full max-w-[1120px] content-center">
        <div className="rounded-[18px] bg-white p-5 shadow-2xl sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-4">
            <h2
              id="invoice-modal-title"
              className="text-[25px] font-semibold text-[#1b212d]"
            >
              {title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-[#929eae] hover:bg-[#fafafa] hover:text-[#1b212d]"
            >
              <X />
              <span className="sr-only">Close modal</span>
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function InvoiceFormModal({
  invoice,
  onClose,
}: {
  invoice?: Invoice;
  onClose: () => void;
}) {
  const preview = invoice
    ? calculateInvoiceFinancials(invoice.amount, invoice.vatRate)
    : calculateInvoiceFinancials(0, 7.5);

  return (
    <ModalShell
      title={
        invoice
          ? `Edit Invoice: ${invoiceCode(invoice.id)}`
          : "New Invoice: Draft"
      }
      onClose={onClose}
    >
      <div className="grid gap-[70px] xl:grid-cols-[minmax(0,675px)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[10px] bg-[#1b212d] p-5 text-white">
            <div className="pointer-events-none absolute -top-24 left-56 size-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-24 left-28 size-44 rounded-full bg-white/5" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-[42px] items-center justify-center rounded-full bg-white">
                  <Image
                    src="/figma/maglo-exclude.svg"
                    alt=""
                    width={30}
                    height={30}
                  />
                </span>
                <div>
                  <p className="text-xl font-semibold">Maglo</p>
                  <p className="mt-1 text-sm text-white/80">sales@maglo.com</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white md:text-right">
                <p>1333 Grey Fox Farm Road</p>
                <p>Houston, TX 77060</p>
                <p>Bloomfield Hills, Michigan(MI), 48301</p>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] bg-[#fafafa] p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-[#1b212d]">
                  Invoice Number
                </h3>
                <p className="mt-4 text-sm text-[#6b7183]">
                  {invoice ? invoiceCode(invoice.id) : "Generated on save"}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  Issued Date:{" "}
                  {invoice ? formatInvoiceDate(invoice.$createdAt) : "Today"}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  Due Date:{" "}
                  {invoice ? formatInvoiceDate(invoice.dueDate) : "Select date"}
                </p>
              </div>
              <div className="text-left md:text-right">
                <h3 className="text-lg font-semibold text-[#1b212d]">
                  Billed to
                </h3>
                <p className="mt-4 text-sm text-[#6b7183]">
                  {invoice?.clientName ?? "Client name"}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  {invoice?.clientEmail ?? "client@email.com"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#1b212d]">
              Item Details
            </h3>
            <p className="mt-1 text-sm text-[#929eae]">
              Details item with more info
            </p>
            <div className="mt-6">
              <InvoiceForm
                invoice={invoice}
                onSaved={onClose}
                onCancel={onClose}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-[30px]">
          <section className="rounded-[10px] border border-[#f5f5f5] p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-[#1b212d]">
                Client Details
              </h3>
              <MoreHorizontal className="size-5 text-[#929eae]" />
            </div>
            <div className="mt-6 flex items-center gap-4 border-b border-[#f5f5f5] pb-5">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#f5f5f5] text-base font-semibold text-[#1b212d]">
                {invoice ? initials(invoice.clientName) : "SR"}
              </span>
              <div>
                <p className="font-semibold text-[#1b212d]">
                  {invoice?.clientName ?? "Client Name"}
                </p>
                <p className="mt-1 text-sm text-[#929eae]">
                  {invoice?.clientEmail ?? "client@email.com"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <p className="font-semibold text-[#1b212d]">UIHUT Agency LTD</p>
              <p className="mt-2 text-sm text-[#929eae]">
                3471 Rainy Day Drive Tulsa, USA
              </p>
              <button
                type="button"
                className="mt-5 h-12 w-full rounded-[10px] bg-emerald-50 text-sm font-semibold text-[#00aa78]"
                onClick={() =>
                  toast.info("Customer details are captured on the invoice.")
                }
              >
                Add Customer
              </button>
            </div>
          </section>

          <section className="rounded-[10px] border border-[#f5f5f5] p-6">
            <h3 className="text-lg font-semibold text-[#1b212d]">Basic Info</h3>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-[#929eae]">Subtotal preview</p>
                <div className="mt-3 flex h-12 items-center justify-between rounded-[10px] border border-[#f5f5f5] px-5 text-sm text-[#1b212d]">
                  {formatNaira(preview.amount)}
                  <ReceiptText className="size-5 text-[#929eae]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#929eae]">VAT preview</p>
                <div className="mt-3 flex h-12 items-center justify-between rounded-[10px] border border-[#f5f5f5] px-5 text-sm text-[#1b212d]">
                  {formatNaira(preview.vatAmount)}
                  <CalendarDays className="size-5 text-[#929eae]" />
                </div>
              </div>
              <button
                type="button"
                className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-sm font-semibold text-[#1b212d]"
                onClick={() =>
                  toast.info("Invoice is saved when you submit the form.")
                }
              >
                Send Invoice
              </button>
              <div className="grid grid-cols-2 gap-5">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#fafafa] text-sm font-semibold text-[#00aa78]"
                  onClick={() =>
                    toast.info("Preview updates as invoice fields change.")
                  }
                >
                  <Eye className="size-5" />
                  Preview
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#fafafa] text-sm font-semibold text-[#00aa78]"
                  onClick={() => window.print()}
                >
                  <Download className="size-5" />
                  Download
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </ModalShell>
  );
}

function InvoiceDetailModal({
  invoice,
  onClose,
  onEdit,
}: {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <ModalShell
      title={`New Invoices: ${invoiceCode(invoice.id)}`}
      onClose={onClose}
    >
      <div className="grid gap-[70px] xl:grid-cols-[minmax(0,675px)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[10px] bg-[#1b212d] p-5 text-white">
            <div className="pointer-events-none absolute -top-24 left-56 size-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-24 left-28 size-44 rounded-full bg-white/5" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex size-[42px] items-center justify-center rounded-full bg-white">
                  <Image
                    src="/figma/maglo-exclude.svg"
                    alt=""
                    width={30}
                    height={30}
                  />
                </span>
                <div>
                  <p className="text-xl font-semibold">Maglo</p>
                  <p className="mt-1 text-sm text-white/80">sales@maglo.com</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white md:text-right">
                <p>1333 Grey Fox Farm Road</p>
                <p>Houston, TX 77060</p>
                <p>Bloomfield Hills, Michigan(MI), 48301</p>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] bg-[#fafafa] p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-[#1b212d]">
                  Invoice Number
                </h3>
                <p className="mt-4 text-sm text-[#6b7183]">
                  {invoiceCode(invoice.id)}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  Issued Date: {formatInvoiceDate(invoice.$createdAt)}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  Due Date: {formatInvoiceDate(invoice.dueDate)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <h3 className="text-lg font-semibold text-[#1b212d]">
                  Billed to
                </h3>
                <p className="mt-4 text-sm text-[#6b7183]">
                  {invoice.clientName}
                </p>
                <p className="mt-2 text-sm text-[#6b7183]">
                  {invoice.clientEmail}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#1b212d]">
              Item Details
            </h3>
            <p className="mt-1 text-sm text-[#929eae]">
              Details item with more info
            </p>
            <div className="mt-6 grid grid-cols-[1fr_92px_92px_92px] gap-5 text-sm font-semibold uppercase text-[#929eae] max-md:hidden">
              <span>Item</span>
              <span className="text-center">Order/type</span>
              <span className="text-center">Rate</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="mt-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-[1fr_92px_92px_92px] md:items-center">
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-sm">
                  {invoice.clientName} service
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-center text-sm">
                  01
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-center text-sm">
                  {formatNaira(invoice.amount)}
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-right text-sm">
                  {formatNaira(invoice.amount)}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_92px_92px_92px] md:items-center">
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-sm">
                  VAT
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-center text-sm">
                  {invoice.vatRate}%
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-center text-sm">
                  {formatNaira(invoice.vatAmount)}
                </div>
                <div className="rounded-[10px] border border-[#f5f5f5] px-4 py-3 text-right text-sm">
                  {formatNaira(invoice.vatAmount)}
                </div>
              </div>
            </div>
            <div className="ml-auto mt-7 w-full max-w-[275px] space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {formatNaira(invoice.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-semibold text-[#00aa78]">Add</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold">
                  {formatNaira(invoice.vatAmount)}
                </span>
              </div>
              <div className="border-t border-[#f5f5f5] pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatNaira(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-[30px]">
          <section className="rounded-[10px] border border-[#f5f5f5] p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-[#1b212d]">
                Client Details
              </h3>
              <MoreHorizontal className="size-5 text-[#929eae]" />
            </div>
            <div className="mt-6 flex items-center gap-4 border-b border-[#f5f5f5] pb-5">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#f5f5f5] text-base font-semibold text-[#1b212d]">
                {initials(invoice.clientName)}
              </span>
              <div>
                <p className="font-semibold text-[#1b212d]">
                  {invoice.clientName}
                </p>
                <p className="mt-1 text-sm text-[#929eae]">
                  {invoice.clientEmail}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <p className="font-semibold text-[#1b212d]">UIHUT Agency LTD</p>
              <p className="mt-2 text-sm text-[#929eae]">
                3471 Rainy Day Drive Tulsa, USA
              </p>
              <button
                type="button"
                className="mt-5 h-12 w-full rounded-[10px] bg-emerald-50 text-sm font-semibold text-[#00aa78]"
                onClick={onEdit}
              >
                Edit Customer
              </button>
            </div>
          </section>

          <section className="rounded-[10px] border border-[#f5f5f5] p-6">
            <h3 className="text-lg font-semibold text-[#1b212d]">Basic Info</h3>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-[#929eae]">Invoice Date</p>
                <div className="mt-3 flex h-12 items-center justify-between rounded-[10px] border border-[#f5f5f5] px-5 text-sm text-[#1b212d]">
                  {formatInvoiceDate(invoice.$createdAt)}
                  <CalendarDays className="size-5 text-[#929eae]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#929eae]">Due Date</p>
                <div className="mt-3 flex h-12 items-center justify-between rounded-[10px] border border-[#f5f5f5] px-5 text-sm text-[#1b212d]">
                  {formatInvoiceDate(invoice.dueDate)}
                  <CalendarDays className="size-5 text-[#929eae]" />
                </div>
              </div>
              <button
                type="button"
                className="h-12 w-full rounded-[10px] bg-[#c8ee44] text-sm font-semibold text-[#1b212d]"
                onClick={() => toast.success("Invoice ready to send.")}
              >
                Send Invoice
              </button>
              <div className="grid grid-cols-2 gap-5">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#fafafa] text-sm font-semibold text-[#00aa78]"
                >
                  <Eye className="size-5" />
                  Preview
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#fafafa] text-sm font-semibold text-[#00aa78]"
                  onClick={() => window.print()}
                >
                  <Download className="size-5" />
                  Download
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </ModalShell>
  );
}

function InvoiceActionMenu({
  invoice,
  isPending,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: {
  invoice: Invoice;
  isPending: boolean;
  onView: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute right-0 top-9 z-10 w-48 rounded-[12px] border border-[#f5f5f5] bg-white p-2 shadow-xl">
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-[#1b212d] hover:bg-[#fafafa]"
        onClick={onView}
      >
        <Eye className="size-4" />
        View
      </button>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-[#1b212d] hover:bg-[#fafafa]"
        onClick={onEdit}
      >
        <Pencil className="size-4" />
        Edit
      </button>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-[#1b212d] hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        onClick={onStatus}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : invoice.status === "paid" ? (
          <XCircle className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        Mark {invoice.status === "paid" ? "unpaid" : "paid"}
      </button>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-sm text-red-600 hover:bg-red-50"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
        Delete
      </button>
    </div>
  );
}

export function InvoicesWorkspace({
  invoices,
  loadError,
}: InvoicesWorkspaceProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filterOpen, setFilterOpen] = useState(false);
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
      closeActionMenu();
      router.refresh();
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
      closeDelete();
      router.refresh();
    });
  }

  return (
    <div className="space-y-9">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[25px] font-semibold tracking-normal text-[#1b212d]">
            Invoices
          </h1>
          <label className="relative mt-7 block w-full md:w-[225px]">
            <span className="sr-only">Search invoices</span>
            <Search className="absolute left-[18px] top-1/2 size-5 -translate-y-1/2 text-[#1b212d]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices"
              className="h-[48px] w-full rounded-[15px] border border-[#f5f5f5] bg-[#f8f8f8] pl-[54px] pr-4 text-sm text-[#1b212d] outline-none transition placeholder:text-[#929eae] focus:border-[#c8ee44] focus:ring-3 focus:ring-[#c8ee44]/30"
            />
          </label>
        </div>

        <div className="relative flex flex-col gap-3 md:flex-row md:items-center xl:pt-[56px]">
          <Button
            onClick={openCreate}
            className="h-[48px] rounded-[10px] bg-[#c8ee44] px-5 text-sm font-semibold text-[#1b212d] hover:bg-[#b8df35]"
          >
            <ReceiptText />
            Create Invoice
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setFilterOpen((open) => !open)}
            className="h-[48px] rounded-[10px] border-[#f5f5f5] bg-white px-5 text-sm font-medium text-[#1b212d] hover:bg-[#fafafa]"
          >
            <Filter className="size-4" />
            Filters
          </Button>

          {filterOpen ? (
            <div className="absolute right-0 top-full z-20 mt-3 w-[260px] rounded-[15px] border border-[#f5f5f5] bg-white p-4 shadow-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1b212d]">
                <SlidersHorizontal className="size-4" />
                Filter invoices
              </div>
              <div className="mt-4 space-y-2">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-[10px] px-3 text-sm font-medium transition",
                      filter === item.value
                        ? "bg-[#c8ee44] text-[#1b212d]"
                        : "bg-[#fafafa] text-[#929eae] hover:text-[#1b212d]",
                    )}
                  >
                    {item.label}
                    {filter === item.value ? (
                      <CheckCircle2 className="size-4" />
                    ) : null}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm font-medium text-[#1b212d]">
                Rows per page
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="mt-2 h-10 w-full rounded-[10px] border border-[#f5f5f5] bg-white px-3 text-sm outline-none focus:border-[#c8ee44]"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      </section>

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
        {paginatedInvoices.length === 0 ? (
          <div className="rounded-[15px] border border-[#f5f5f5] px-5 py-16 text-center">
            <p className="text-sm font-medium">No invoices found</p>
            <p className="mt-1 text-sm text-[#929eae]">
              {loadError
                ? "The table will appear here once invoice data loads again."
                : "Create an invoice or adjust the current search and filters."}
            </p>
          </div>
        ) : (
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
                {paginatedInvoices.map((invoice) => {
                  const dueState = getDueDateState(
                    invoice.dueDate,
                    invoice.status,
                  );
                  const actionMenuOpen = actionMenuInvoiceId === invoice.id;

                  return (
                    <li
                      key={invoice.id}
                      className="grid min-h-[78px] grid-cols-[minmax(230px,1.5fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_90px] items-center gap-[30px]"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 items-center gap-3 text-left"
                        onClick={() => openView(invoice.id)}
                      >
                        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#f8f8f8] text-sm font-semibold text-[#1b212d]">
                          {initials(invoice.clientName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#1b212d]">
                            {invoice.clientName}
                          </span>
                          <span className="mt-1 block truncate text-[13px] text-[#929eae]">
                            {invoiceDisplayCode(invoice.id)}
                          </span>
                        </span>
                      </button>

                      <div>
                        <p className="text-sm font-medium text-[#1b212d]">
                          {formatInvoiceDate(invoice.$createdAt)}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            dueState.tone === "danger" && "text-red-700",
                            dueState.tone === "warning" && "text-amber-700",
                            dueState.tone === "success" && "text-emerald-700",
                            dueState.tone === "neutral" && "text-[#929eae]",
                          )}
                        >
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

                      <div className="relative flex justify-center">
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-full text-[#00aa78] transition hover:bg-[#d9ffe9]"
                          onClick={() => toggleActionMenu(invoice.id)}
                        >
                          <MoreHorizontal className="size-5" />
                          <span className="sr-only">
                            Open invoice actions for {invoice.clientName}
                          </span>
                        </button>

                        {actionMenuOpen ? (
                          <InvoiceActionMenu
                            invoice={invoice}
                            isPending={isPending}
                            onView={() => openView(invoice.id)}
                            onEdit={() => openEdit(invoice.id)}
                            onStatus={() => updateStatus(invoice)}
                            onDelete={() => openDelete(invoice.id)}
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="space-y-3 lg:hidden">
              {paginatedInvoices.map((invoice) => {
                const dueState = getDueDateState(
                  invoice.dueDate,
                  invoice.status,
                );
                const actionMenuOpen = actionMenuInvoiceId === invoice.id;

                return (
                  <li
                    key={invoice.id}
                    className="rounded-[15px] border border-[#f5f5f5] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="flex min-w-0 items-center gap-3 text-left"
                        onClick={() => openView(invoice.id)}
                      >
                        <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#f8f8f8] text-sm font-semibold text-[#1b212d]">
                          {initials(invoice.clientName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#1b212d]">
                            {invoice.clientName}
                          </span>
                          <span className="mt-1 block truncate text-[13px] text-[#929eae]">
                            {invoiceDisplayCode(invoice.id)}
                          </span>
                        </span>
                      </button>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          className="flex size-8 items-center justify-center rounded-full text-[#00aa78] transition hover:bg-[#d9ffe9]"
                          onClick={() => toggleActionMenu(invoice.id)}
                        >
                          <MoreHorizontal className="size-5" />
                          <span className="sr-only">
                            Open invoice actions for {invoice.clientName}
                          </span>
                        </button>

                        {actionMenuOpen ? (
                          <InvoiceActionMenu
                            invoice={invoice}
                            isPending={isPending}
                            onView={() => openView(invoice.id)}
                            onEdit={() => openEdit(invoice.id)}
                            onStatus={() => updateStatus(invoice)}
                            onDelete={() => openDelete(invoice.id)}
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase text-[#929eae]">
                          Date
                        </p>
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
                        <p className="text-xs font-semibold uppercase text-[#929eae]">
                          Due
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            dueState.tone === "danger" && "text-red-700",
                            dueState.tone === "warning" && "text-amber-700",
                            dueState.tone === "success" && "text-emerald-700",
                            dueState.tone === "neutral" && "text-[#929eae]",
                          )}
                        >
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
              })}
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-[#f5f5f5] pt-5 text-sm text-[#929eae] md:flex-row md:items-center md:justify-between">
          <p>
            Showing {showingStart}-{showingEnd} of {filteredInvoices.length}{" "}
            invoices
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="rounded-[10px] border-[#f5f5f5]"
            >
              <ChevronLeft />
              Previous
            </Button>
            <span className="rounded-[10px] bg-[#fafafa] px-3 py-2 text-[#1b212d]">
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="rounded-[10px] border-[#f5f5f5]"
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b212d]/45 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-invoice-title"
        >
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-xl">
            <h2
              id="delete-invoice-title"
              className="text-lg font-semibold text-[#1b212d]"
            >
              Delete invoice?
            </h2>
            <p className="mt-2 text-sm text-[#929eae]">
              This will permanently delete{" "}
              {invoiceDisplayCode(deletingInvoice.id)} for{" "}
              {deletingInvoice.clientName}.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={closeDelete}
                disabled={isPending}
                className="rounded-[10px] border-[#f5f5f5]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteInvoice}
                disabled={isPending}
                className="rounded-[10px]"
              >
                {isPending ? <Loader2 className="animate-spin" /> : null}
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
