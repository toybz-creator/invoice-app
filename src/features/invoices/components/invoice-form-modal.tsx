"use client";

import {
  CalendarDays,
  Download,
  Eye,
  MoreHorizontal,
  ReceiptText,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { InvoiceForm } from "@/features/invoices/components/invoice-form";
import { InvoiceModalShell } from "@/features/invoices/components/invoice-modal-shell";
import { formatInvoiceDate } from "@/features/invoices/lib/dates";
import { initials, invoiceCode } from "@/features/invoices/lib/display";
import {
  calculateInvoiceFinancials,
  formatNaira,
} from "@/features/invoices/lib/finance";
import type { Invoice } from "@/types/invoice";

export function InvoiceFormModal({
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
    <InvoiceModalShell
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
    </InvoiceModalShell>
  );
}
