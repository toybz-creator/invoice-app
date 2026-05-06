import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types/invoice";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[55px] items-center justify-center rounded-[4px] px-[15px] py-[8px] text-xs font-medium capitalize",
        status === "paid"
          ? "bg-[#d9ffe9] text-[#27ae60]"
          : "bg-[#ffefef] text-[#eb5757]",
      )}
    >
      {status}
    </span>
  );
}
