import Link from "next/link";

import { InvoiceTable } from "@/features/invoices/components/invoice-table";
import type { Invoice } from "@/types/invoice";

export function DashboardRecentInvoices({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="rounded-lg bg-white p-5" aria-labelledby="recent-title">
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-title" className="text-lg font-semibold text-[#1b212d]">
          Recent Invoice
        </h2>
        <Link
          href="/invoices"
          className="text-sm font-semibold text-[#00aa78] transition hover:text-[#1b212d]"
        >
          View All
        </Link>
      </div>

      <div className="mt-5">
        <InvoiceTable
          invoices={invoices.slice(0, 4)}
          emptyTitle="No recent invoices"
          emptyDescription="Create your first invoice to populate dashboard activity."
        />
      </div>
    </section>
  );
}
