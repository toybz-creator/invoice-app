"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { Invoice } from "@/types/invoice";

type InvoiceTableActionMode =
  | {
      type: "interactive";
      activeInvoiceId: string | null;
      isPending: boolean;
      onToggleMenu: (invoiceId: string) => void;
      onView: (invoiceId: string) => void;
      onEdit: (invoiceId: string) => void;
      onStatus: (invoice: Invoice) => void;
      onDelete: (invoiceId: string) => void;
    }
  | {
      type: "link";
      href?: string;
      onView?: (invoiceId: string) => void;
    };

type InvoiceTablePagination = {
  showingStart: number;
  showingEnd: number;
  total: number;
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

type InvoiceTableProps = {
  invoices: Invoice[];
  emptyTitle: string;
  emptyDescription: string;
  actionMode: InvoiceTableActionMode;
  pagination?: InvoiceTablePagination;
};

function dueToneClass(tone: ReturnType<typeof getDueDateState>["tone"]) {
  return cn(
    tone === "danger" && "text-red-700",
    tone === "warning" && "text-amber-700",
    tone === "success" && "text-emerald-700",
    tone === "neutral" && "text-[#929eae]",
  );
}

function InvoiceTableActionCell({
  invoice,
  actionMode,
}: {
  invoice: Invoice;
  actionMode: InvoiceTableActionMode;
}) {
  if (actionMode.type === "link") {
    return (
      <InvoiceTableActions
        mode="link"
        invoice={invoice}
        href={actionMode.href}
      />
    );
  }

  return (
    <InvoiceTableActions
      mode="interactive"
      invoice={invoice}
      isMenuOpen={actionMode.activeInvoiceId === invoice.id}
      isPending={actionMode.isPending}
      onToggleMenu={() => actionMode.onToggleMenu(invoice.id)}
      onView={() => actionMode.onView(invoice.id)}
      onEdit={() => actionMode.onEdit(invoice.id)}
      onStatus={() => actionMode.onStatus(invoice)}
      onDelete={() => actionMode.onDelete(invoice.id)}
    />
  );
}

function InvoiceDesktopRow({
  invoice,
  actionMode,
}: {
  invoice: Invoice;
  actionMode: InvoiceTableActionMode;
}) {
  const dueState = getDueDateState(invoice.dueDate, invoice.status);
  const onOpen =
    actionMode.type === "interactive"
      ? () => actionMode.onView(invoice.id)
      : actionMode.onView
        ? () => actionMode.onView?.(invoice.id)
        : undefined;

  return (
    <li className="grid min-h-[78px] grid-cols-[minmax(230px,1.5fr)_minmax(140px,1fr)_minmax(130px,0.9fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_90px] items-center gap-[30px] text-sm text-[#1b212d]">
      <InvoiceClientCell invoice={invoice} onOpen={onOpen} />

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

      <InvoiceTableActionCell invoice={invoice} actionMode={actionMode} />
    </li>
  );
}

function InvoiceMobileCard({
  invoice,
  actionMode,
}: {
  invoice: Invoice;
  actionMode: InvoiceTableActionMode;
}) {
  const dueState = getDueDateState(invoice.dueDate, invoice.status);
  const onOpen =
    actionMode.type === "interactive"
      ? () => actionMode.onView(invoice.id)
      : actionMode.onView
        ? () => actionMode.onView?.(invoice.id)
        : undefined;

  return (
    <li className="rounded-[15px] border border-[#f5f5f5] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <InvoiceClientCell invoice={invoice} onOpen={onOpen} />

        <div className="shrink-0">
          <InvoiceTableActionCell invoice={invoice} actionMode={actionMode} />
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
  pagination,
}: {
  pagination: InvoiceTablePagination;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-[#f5f5f5] pt-5 text-sm text-[#929eae] md:flex-row md:items-center md:justify-between">
      <p>
        Showing {pagination.showingStart}-{pagination.showingEnd} of{" "}
        {pagination.total} invoices
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={pagination.onPrevious}
          className="rounded-[10px] border-[#f5f5f5]"
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="rounded-[10px] bg-[#fafafa] px-3 py-2 text-[#1b212d]">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={pagination.onNext}
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
  actionMode,
  pagination,
}: InvoiceTableProps) {
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
          {invoices.map((invoice) => (
            <InvoiceDesktopRow
              key={invoice.id}
              invoice={invoice}
              actionMode={actionMode}
            />
          ))}
        </ul>
      </div>

      <ul className="space-y-3 lg:hidden">
        {invoices.map((invoice) => (
          <InvoiceMobileCard
            key={invoice.id}
            invoice={invoice}
            actionMode={actionMode}
          />
        ))}
      </ul>

      {pagination ? <InvoiceTablePagination pagination={pagination} /> : null}
    </>
  );
}
