"use client";

import {
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

import type { Invoice } from "@/types/invoice";

type InvoiceActionMenuProps = {
  invoice: Invoice;
  isPending: boolean;
  onView: () => void;
  onEdit: () => void;
  onStatus: () => void;
  onDelete: () => void;
};

export function InvoiceActionMenu({
  invoice,
  isPending,
  onView,
  onEdit,
  onStatus,
  onDelete,
}: InvoiceActionMenuProps) {
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
