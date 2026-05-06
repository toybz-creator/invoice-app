"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { invoiceDisplayCode } from "@/features/invoices/lib/display";
import type { Invoice } from "@/types/invoice";

type DeleteInvoiceDialogProps = {
  invoice: Invoice;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteInvoiceDialog({
  invoice,
  isPending,
  onCancel,
  onConfirm,
}: DeleteInvoiceDialogProps) {
  return (
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
          This will permanently delete {invoiceDisplayCode(invoice.id)} for{" "}
          {invoice.clientName}.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-[10px] border-[#f5f5f5]"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-[10px]"
          >
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
