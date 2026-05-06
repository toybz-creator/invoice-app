import {
  initials,
  invoiceAvatarTone,
  invoiceDisplayCode,
} from "@/features/invoices/lib/display";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

type InvoiceClientCellProps = {
  invoice: Invoice;
  onOpen?: () => void;
};

export function InvoiceClientCell({ invoice, onOpen }: InvoiceClientCellProps) {
  const content = (
    <>
      <span
        className={cn(
          "flex size-[38px] shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          invoiceAvatarTone(invoice.clientName),
        )}
      >
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
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className="flex min-w-0 items-center gap-3 text-left"
        onClick={onOpen}
      >
        {content}
      </button>
    );
  }

  return <div className="flex min-w-0 items-center gap-3">{content}</div>;
}
