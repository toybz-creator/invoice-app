"use client";

import { CalendarDays, Download, Eye, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { InvoiceModalShell } from "@/features/invoices/components/invoice-modal-shell";
import { formatInvoiceDate } from "@/features/invoices/lib/dates";
import { initials, invoiceCode } from "@/features/invoices/lib/display";
import { formatNaira } from "@/features/invoices/lib/finance";
import type { Invoice } from "@/types/invoice";

export function InvoiceDetailModal({
  invoice,
  onClose,
  onEdit,
}: {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <InvoiceModalShell
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
    </InvoiceModalShell>
  );
}
